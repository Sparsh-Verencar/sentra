"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Pencil, Trash2, UniversityIcon } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";

/* ========================================================= */

export default function HostelPage() {
  const hostels = useQuery(api.hostels.getHostels);

  // hostel
  const createHostel = useMutation(api.hostels.createHostel);
  const updateHostel = useMutation(api.hostels.updateHostel);
  const deleteHostel = useMutation(api.hostels.deleteHostel);

  // block
  const createBlock = useMutation(api.block.createBlock);
  const updateBlock = useMutation(api.block.updateBlock);
  const deleteBlock = useMutation(api.block.deleteBlock);

  // room
  const createRoom = useMutation(api.room.createRoom);
  const updateRoom = useMutation(api.room.updateRoom);
  const deleteRoom = useMutation(api.room.deleteRoom);

  const [hostelName, setHostelName] = useState("");
  const [hostelType, setHostelType] = useState("boys");

  const [blockNames, setBlockNames] = useState<Record<string, string>>({});
  const [roomNos, setRoomNos] = useState<Record<string, string>>({});
  const [capacities, setCapacities] = useState<Record<string, number>>({});

  const [editing, setEditing] = useState<{
    type: "hostel" | "block" | "room";
    data: any;
  } | null>(null);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Hostel Structure</h1>

      {/* ADD HOSTEL DRAWER */}
      <Drawer direction="right">
        <DrawerTrigger asChild>
          <Button>+ Add Hostel</Button>
        </DrawerTrigger>

        <DrawerContent className="right-0 left-auto h-full w-[400px] rounded-none">
          <DrawerHeader>
            <DrawerTitle>Add Hostel</DrawerTitle>
          </DrawerHeader>

          <div className="p-4 space-y-4">
            <Input
              placeholder="Hostel name"
              value={hostelName}
              onChange={(e) => setHostelName(e.target.value)}
            />

            <Select value={hostelType} onValueChange={setHostelType}>
              <SelectGroup>
                <SelectTrigger>
                  <SelectValue placeholder="Hostel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boys">Boys Hostel</SelectItem>
                  <SelectItem value="girls">Girls Hostel</SelectItem>
                </SelectContent>
              </SelectGroup>
            </Select>
          </div>

          <DrawerFooter>
            <Button
              onClick={() => {
                if (!hostelName.trim()) return;

                createHostel({
                  hostel_name: hostelName,
                  hostel_type: hostelType,
                });

                setHostelName("");
                setHostelType("boys");
              }}
            >
              Add Hostel
            </Button>

            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Separator />

      {/* HOSTEL LIST */}
      {hostels?.map((hostel) => (
        <Card key={hostel._id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UniversityIcon />
              {hostel.hostel_name} ({hostel.hostel_type})
            </CardTitle>

            <div className="flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() =>
                  setEditing({ type: "hostel", data: hostel })
                }
              >
                <Pencil className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => deleteHostel({ id: hostel._id })}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* ADD BLOCK */}
            <div className="flex gap-2">
              <Input
                placeholder="Block name"
                value={blockNames[hostel._id] || ""}
                onChange={(e) =>
                  setBlockNames({
                    ...blockNames,
                    [hostel._id]: e.target.value,
                  })
                }
              />

              <Button
                onClick={() => {
                  if (!blockNames[hostel._id]) return;

                  createBlock({
                    blockName: blockNames[hostel._id],
                    hostelId: hostel._id,
                  });

                  setBlockNames({
                    ...blockNames,
                    [hostel._id]: "",
                  });
                }}
              >
                Add Block
              </Button>
            </div>

            <BlockSection
              hostelId={hostel._id}
              createRoom={createRoom}
              updateBlock={updateBlock}
              updateRoom={updateRoom}
              deleteBlock={deleteBlock}
              deleteRoom={deleteRoom}
              roomNos={roomNos}
              capacities={capacities}
              setRoomNos={setRoomNos}
              setCapacities={setCapacities}
              setEditing={setEditing}
            />
          </CardContent>
        </Card>
      ))}

      {/* EDIT DRAWER */}
      {editing && (
        <Drawer
          open={true}
          onOpenChange={() => setEditing(null)}
          direction="right"
        >
          <DrawerContent className="right-0 left-auto h-full w-[400px] rounded-none">
            <DrawerHeader>
              <DrawerTitle>Edit</DrawerTitle>
            </DrawerHeader>

            <div className="p-4 space-y-4">
              {editing.type === "hostel" && (
                <>
                  <Input
                    value={editing.data.hostel_name}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        data: {
                          ...editing.data,
                          hostel_name: e.target.value,
                        },
                      })
                    }
                  />

                  <Select
                    value={editing.data.hostel_type}
                    onValueChange={(v) =>
                      setEditing({
                        ...editing,
                        data: {
                          ...editing.data,
                          hostel_type: v,
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boys">Boys</SelectItem>
                      <SelectItem value="girls">Girls</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}

              {editing.type === "block" && (
                <Input
                  value={editing.data.block_name}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      data: {
                        ...editing.data,
                        block_name: e.target.value,
                      },
                    })
                  }
                />
              )}

              {editing.type === "room" && (
                <>
                  <Input
                    value={editing.data.room_no}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        data: {
                          ...editing.data,
                          room_no: e.target.value,
                        },
                      })
                    }
                  />

                  <Input
                    type="number"
                    value={editing.data.capacity}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        data: {
                          ...editing.data,
                          capacity: Number(e.target.value),
                        },
                      })
                    }
                  />
                </>
              )}
            </div>

            <DrawerFooter>
              <Button
                onClick={() => {
                  if (!editing) return;

                  if (editing.type === "hostel") {
                    updateHostel({
                      id: editing.data._id,
                      hostel_name: editing.data.hostel_name,
                      hostel_type: editing.data.hostel_type,
                    });
                  }

                  if (editing.type === "block") {
                    updateBlock({
                      id: editing.data._id,
                      block_name: editing.data.block_name,
                    });
                  }

                  if (editing.type === "room") {
                    updateRoom({
                      id: editing.data._id,
                      room_no: editing.data.room_no,
                      capacity: editing.data.capacity,
                    });
                  }

                  setEditing(null);
                }}
              >
                Save Changes
              </Button>

              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}

/* ========================================================= */

function BlockSection({
  hostelId,
  createRoom,
  deleteBlock,
  deleteRoom,
  updateBlock,
  updateRoom,
  roomNos,
  capacities,
  setRoomNos,
  setCapacities,
  setEditing,
}: any) {
  const blocks = useQuery(api.block.getBlocksByHostel, { hostelId });

  if (!blocks?.length) return null;

  return (
    <div className="space-y-3">
      {blocks.map((block: any) => (
        <div key={block._id} className="border p-4 rounded-md space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Block {block.block_name}</h3>

            <div className="flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() =>
                  setEditing({ type: "block", data: block })
                }
              >
                <Pencil className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => deleteBlock({ id: block._id })}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Room no"
              value={roomNos[block._id] || ""}
              onChange={(e) =>
                setRoomNos({
                  ...roomNos,
                  [block._id]: e.target.value,
                })
              }
            />

            <Input
              type="number"
              placeholder="Capacity"
              onChange={(e) =>
                setCapacities({
                  ...capacities,
                  [block._id]: Number(e.target.value),
                })
              }
            />

            <Button
              onClick={() => {
                if (!roomNos[block._id]) return;

                createRoom({
                  room_no: roomNos[block._id],
                  capacity: capacities[block._id] || 0,
                  block_id: block._id,
                });

                setRoomNos({
                  ...roomNos,
                  [block._id]: "",
                });
              }}
            >
              Add Room
            </Button>
          </div>

          <RoomList
            blockId={block._id}
            deleteRoom={deleteRoom}
            setEditing={setEditing}
          />
        </div>
      ))}
    </div>
  );
}

function RoomList({
  blockId,
  deleteRoom,
  setEditing,
}: any) {
  const rooms = useQuery(api.room.getRoomsByBlock, {
    blockId: blockId,
  });

  if (!rooms?.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {rooms.map((room: any) => (
        <div
          key={room._id}
          className="flex items-center gap-2 border px-3 py-1 rounded"
        >
          <span>
            Room no:{room.room_no} | Capacity: {room.capacity}
          </span>

          <Button
            size="icon"
            variant="ghost"
            onClick={() =>
              setEditing({ type: "room", data: room })
            }
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => deleteRoom({ id: room._id })}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ))}
    </div>
  );
}
