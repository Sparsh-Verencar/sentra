"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

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
import { SelectLabel } from "@radix-ui/react-select";
import { UniversityIcon } from "lucide-react";


export default function HostelPage() {
  // ✅ CORRECT API NAMES
  const hostels = useQuery(api.hostels.getHostels);
  const createHostel = useMutation(api.hostels.createHostel);

  const createBlock = useMutation(api.block.createBlock);
  const createRoom = useMutation(api.room.createRoom);

  const [hostelName, setHostelName] = useState("");
  const [hostelType, setHostelType] = useState("boy");

  const [blockNames, setBlockNames] = useState<Record<string, string>>({});
  const [roomNos, setRoomNos] = useState<Record<string, string>>({});
  const [capacities, setCapacities] = useState<Record<string, number>>({});

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Hostel Management</h1>

      {/* ADD HOSTEL */}
      {/* ADD HOSTEL DRAWER */}
      <Drawer direction="right">
        <DrawerTrigger asChild>
          <Button className="w-fit">+ Add Hostel</Button>
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

            <Select
              value={hostelType}
              onValueChange={(value) => setHostelType(value)}
            >
              <SelectGroup>
                <SelectLabel>Hostel Type</SelectLabel>
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

      {/* HOSTELS */}
      {hostels?.map((hostel) => (
        <Card key={hostel._id}>
          <CardHeader>
            <CardTitle>
              <UniversityIcon/> {hostel.hostel_name} ({hostel.hostel_type})
            </CardTitle>
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
              roomNos={roomNos}
              capacities={capacities}
              setRoomNos={setRoomNos}
              setCapacities={setCapacities}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ================= BLOCK SECTION ================= */

function BlockSection({
  hostelId,
  createRoom,
  roomNos,
  capacities,
  setRoomNos,
  setCapacities,
}: any) {
  const blocks = useQuery(api.block.getBlocksByHostel, {
    hostelId: hostelId,
  });

  if (!blocks?.length) return null;

  return (
    <div className="space-y-3">
      {blocks.map((block: any) => (
        <div
          key={block._id}
          className="border rounded-md p-4 space-y-2"
        >
          <h3 className="font-semibold">Block {block.block_name}</h3>

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

          <RoomList blockId={block._id} />
        </div>
      ))}
    </div>
  );
}

/* ================= ROOM LIST ================= */

function RoomList({ blockId }: { blockId: string }) {
  const rooms = useQuery(api.room.getRoomsByBlock, {
    block_id: blockId,
  });

  return (
    <div className="flex flex-wrap gap-2">
      {rooms?.map((room) => (
        <span
          key={room._id}
          className="px-3 py-1 border rounded text-sm"
        >
          Room no.: {room.room_no} | Capacity: {room.capacity}
        </span>
      ))}
    </div>
  );
}
