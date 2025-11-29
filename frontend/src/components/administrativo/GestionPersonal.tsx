import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Plus, Search, Mail, Phone, Trash2 } from "lucide-react";
import { toast } from "sonner@2.0.3";
import type { Rol, Tutor, User } from "../../lib/types";
import { useAuth } from "../../contexts/AuthContext";

export default function GestionPersonal() {
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Rol | string>("");
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [personal, setPersonal] = useState<User[]>([]);
  // IDs de cartas (slots de tutor)
  const [tutorCards, setTutorCards] = useState<number[]>([]);
  // asignación personaId por cada cartaId
  const [tutorAssignments, setTutorAssignments] = useState<
    Record<number, string | null>
  >({});

  const navigate = useNavigate();

  const getTutors = async () => {
    const url = `http://127.0.0.1:8000/tutores/all`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.log(response.statusText);
      return [];
    }

    const tutoresData = await response.json();
    return tutoresData as Tutor[];
  };

  const getPersonal = async () => {
    const url = `http://127.0.0.1:8000/personas/`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.log(response.statusText);
      return [];
    }

    const personalData = await response.json();
    return personalData as User[];
  };

  // TODO: aquí deberías traer el personal desde tu backend y hacer setPersonal(...)
  useEffect(() => {
    const obtenerPersonal = async () => {
      const data = await getPersonal();
      setPersonal(data);
    };
    obtenerPersonal();
  }, []);


  useEffect(() => {
    const obtenerTutores = async () => {
      const data = await getTutors();
      setTutors(data);
      // 👇 Si cada "tutor" del backend representa un slot, puedes inicializar las cartas aquí:
      setTutorCards(data.map((tutor) => tutor.id_tutor));
      const mapped = data.reduce<Record<number, string | null>>((acc, tutor) => {
        acc[tutor.id_tutor] = String(tutor.id_persona);
        return acc;
      }, {})
      setTutorAssignments(mapped)
    };
    obtenerTutores();
  }, []);




  const filteredTutores = personal.filter(
    (persona) =>
      persona.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      persona.id_persona.toString().includes(searchTerm) ||
      persona.correo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVerDetalles = () => {
    if (user.rol === "ADMINISTRATIVO") {
      toast.error("No es posible continuar con esta acción debido a tu rol.");
      return;
    }
    navigate("/admin/usuarios");
  };

  // añadir nueva carta de tutor (nuevo slot)
  const handleAddTutorCard = () => {
    setTutorCards((prev) => {
      const newId = prev.length > 0 ? Math.max(...prev) + 1 : 0;
      const next = [...prev, newId];

      // 👇 AQUÍ llamamos al backend para crear un NUEVO TUTOR / SLOT (fire-and-forget)
      const payload = { id_persona: null };
      (async () => {
        try {
          await fetch("http://127.0.0.1:8000/tutores/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          // Opcional: refrescar la lista de tutores llamando a getTutors()
        } catch (err) {
          console.error("Error creando slot de tutor:", err);
        }
      })();

      return next;
    });
  };

  // borrar una carta de tutor
  const handleDeleteTutorCard = (cardId: number) => {
    setTutorCards((prev) => prev.filter((id) => id !== cardId));

    setTutorAssignments((prev) => {
      const updated = { ...prev };
      delete updated[cardId];
      return updated;
    });

    // 👇 AQUÍ deberías llamar al backend para BORRAR el tutor / slot
    (async () => {
      await fetch(`http://127.0.0.1:8000/tutores/${cardId}`, {
        method: "DELETE",
      });
    })()
    // Y probablemente refrescar el estado desde el backend
  };

  // asignar persona a una carta de tutor, garantizando que no se repita en otra
  const handleSelectPersonaForCard = async (cardId: number, personaId: string) => {
    setTutorAssignments((prev) => {
      const updated: Record<number, string | null> = { ...prev };

      // si esa persona ya estaba en otro tutor, la quitamos de ese tutor
      Object.keys(updated).forEach((key) => {
        const existingCardId = Number(key);
        if (updated[existingCardId] === personaId && existingCardId !== cardId) {
          updated[existingCardId] = null;
          (async () => {
            await fetch(`http://127.0.0.1:8000/tutores/${existingCardId}/desvincular-persona`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
            });
          })()
        }
      });

      updated[cardId] = personaId;

      // 👇 AQUÍ deberías llamar al backend para guardar la ASIGNACIÓN
      const payload = {
        id_persona: personaId,
      };
      (async () => {
        await fetch(`http://127.0.0.1:8000/tutores/${cardId}/asignar-persona`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      })()

      return updated;
    });
  };

  const handleCreatePersonal = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const data = {
      nombre: formData.get("nombre"),
      id_persona: formData.get("documento"),
      rol: selectedRole,
      correo: formData.get("email"),
    };

    console.log(data);

    const url = `http://127.0.0.1:8000/personas/`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Error Creando persona");
    }

    toast.success("Persona contratada exitosamente");

    const updated = await getPersonal()
    setPersonal(updated)

    setOpenDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Gestión de Personal</h1>
          <p className="text-muted-foreground">
            Administra Personas y asignaciones de roles
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Contratar Persona
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Contratar Nueva Persona</DialogTitle>
              <DialogDescription>
                Ingresa los datos de la persona
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePersonal} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="persona-nombre">Nombre Completo</Label>
                <Input
                  id="persona-nombre"
                  name="nombre"
                  placeholder="Ej: Carlos Rodríguez"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="persona-documento">Documento</Label>
                <Input
                  id="persona-documento"
                  name="documento"
                  placeholder="1122334455"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="persona-email">Correo Electrónico</Label>
                <Input
                  id="persona-email"
                  type="email"
                  name="email"
                  placeholder="tutor@globalenglish.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="persona-role">Rol</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar Rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="TUTOR" value="TUTOR">
                      Tutor
                    </SelectItem>
                    {user?.rol === 'ADMINISTRADOR' && <SelectItem key="ADMINISTRATIVO" value="ADMINISTRATIVO">
                      Administrativo
                    </SelectItem>}
                    {user?.rol === 'ADMINISTRADOR' && <SelectItem key="ADMINISTRADOR" value="ADMINISTRADOR">
                      Administrador
                    </SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenDialog(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Contratar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, documento o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabla de personal */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Registrados ({filteredTutores.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTutores.map((persona) => (
                <TableRow key={persona.id_persona}>
                  <TableCell>{persona.nombre}</TableCell>
                  <TableCell>{persona.id_persona}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="w-3 h-3" />
                        {persona.correo}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {persona.rol}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleVerDetalles}
                    >
                      Ver Detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tutors Cards View: slots de tutor */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tutores</h2>
        <Button size="sm" onClick={handleAddTutorCard}>
          <Plus className="w-4 h-4 mr-2" />
          Añadir carta
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tutorCards.map((cardId, index) => {
          const personaId = tutorAssignments[cardId] ?? "";
          const persona =
            personal.find(
              (p) => String(p.id_persona) === String(personaId)
            ) || null;

          return (
            <Card key={cardId}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg">
                    Tutor {index + 1}
                  </CardTitle>
                  {persona && (
                    <p className="text-sm text-muted-foreground">
                      {persona.nombre} - {persona.id_persona}
                    </p>
                  )}
                </div>

                {/* Botón para borrar este tutor / carta */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleDeleteTutorCard(cardId)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div className="space-y-1 text-sm">
                    {persona ? (
                      <>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {persona.correo}
                          </span>
                        </div>

                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Ninguna persona asignada a este tutor.
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t space-y-2">
                    <p className="text-sm">Asignar persona a este tutor</p>
                    <Select
                      value={personaId}
                      onValueChange={(value) =>
                        handleSelectPersonaForCard(cardId, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar persona" />
                      </SelectTrigger>
                      <SelectContent>
                        {personal.map((p) => {
                          if (p.rol === 'TUTOR') {
                            return (<SelectItem
                              key={p.id_persona}
                              value={String(p.id_persona)}
                            >
                              {p.nombre} - {p.id_persona}
                            </SelectItem>)
                          }
                        }
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
