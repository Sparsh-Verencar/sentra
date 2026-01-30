"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "convex/values";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";

import { useAuthActions } from "@convex-dev/auth/react";
export default function Onboardingcontent() {
  const router = useRouter();

const admin = useQuery(api.admin.getCurrentAdmin);
console.log("ADMIN QUERY RESULT:", admin);
const { signOut } = useAuthActions();

  const createHostel = useMutation(api.hostels.createHostel);
  const addBlock = useMutation(api.block.createBlock);

  const hostelTypes = useQuery(api.hostels.getHostelTypes);
  const blocks = useQuery(api.block.getBlocks);

  const [boysHostel, setBoysHostel] = useState("");
  const [girlsHostel, setGirlsHostel] = useState("");

  const [selectedHostel, setSelectedHostel] = useState<{
    id: Id<"hostel">;
    type: string;
  } | null>(null);

  const [open, setOpen] = useState(false);
  const [blockName, setBlockName] = useState("");

  const handleSave = async () => {
    if (boysHostel) {
      await createHostel({ name: boysHostel, type: "boys" });
    }
    if (girlsHostel) {
      await createHostel({ name: girlsHostel, type: "girls" });
    }
  };

  const handleAddBlock = async () => {
    if (!selectedHostel) return;
    if (!blockName) return;

    await addBlock({
      blockName,
      hostelId: selectedHostel.id,
    });

    setBlockName("");
  };

  const filteredBlocks = blocks?.filter(
    (b: any) => b.hostel_id === selectedHostel?.id
  );

  // ---- ROOMS TAB STATES (NEW)
  const [selectedBlock, setSelectedBlock] = useState<Id<"block"> | null>(null);
  const [selectedBlockName, setSelectedBlockName] = useState<string>("");
  const [roomNo, setRoomNo] = useState("");
  const [capacity, setCapacity] = useState<number>(1);
const rooms = useQuery(
  api.rooms.getRoomsByBlock,
  selectedBlock ? { blockId: selectedBlock } : "skip",
);

  const createRoom = useMutation(api.rooms.createRoom);
  

  const handleAddRoom = async () => {
    if (!selectedBlock || !roomNo) return;

    await createRoom({
      roomNo,
      capacity,
      blockId: selectedBlock,
    });

    setRoomNo("");
    setCapacity(1);
  };

  //ADMIN LOGOUT
  const handleAdminLogout = async () => {
    await signOut();          // invalidate Convex Auth session
    router.push("/Staff_and_Students_Login");         // or wherever you want after logout
  };

  return (
      <div className="max-w-xl mx-auto mt-10">

    {/* ---------------- ADMIN INFO HEADER ---------------- */}
<Card className="mb-6">
  <CardHeader className="flex flex-row items-center justify-between">

    {/* Admin Details */}
    <div>
      <CardTitle className="text-lg">
        Welcome, {admin?.admin_name}
      </CardTitle>

      <CardDescription className="space-y-1 mt-2">
        <p>Email: <b>{admin?.email}</b></p>
        <p>Organisation: <b>{admin?.organisation_name}</b></p>
        <p>
         
        </p>
      </CardDescription>
    </div>

    {/* Logout Button */}
    <Button variant="destructive" onClick={handleAdminLogout}>
      Logout
    </Button>

  </CardHeader>
</Card>

    <Tabs defaultValue="overview" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="Hostel">Hostel</TabsTrigger>
        <TabsTrigger value="Block">Blocks</TabsTrigger>
        <TabsTrigger value="reports">Rooms</TabsTrigger>
      </TabsList>


      {/* ---------------------- HOSTEL TAB ---------------------- */}
      <TabsContent value="Hostel">
        <Card>
          <CardHeader>
            <CardTitle>Enter Hostel Details</CardTitle>
            <CardDescription className="space-y-4">
              <div>
                <Label htmlFor="boys">Boys Hostel</Label>
                <Input
                  id="boys"
                  placeholder="Hostel name"
                  value={boysHostel}
                  onChange={(e) => setBoysHostel(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="girls">Girls Hostel</Label>
                <Input
                  id="girls"
                  placeholder="Hostel name"
                  value={girlsHostel}
                  onChange={(e) => setGirlsHostel(e.target.value)}
                />
              </div>

              <Button onClick={handleSave}>Save Hostels</Button>
            </CardDescription>
          </CardHeader>
        </Card>
      </TabsContent>

      {/* ---------------------- BLOCK TAB ---------------------- */}
      <TabsContent value="Block">
        <Card>
          <CardHeader>
            <CardTitle>Enter Block Details</CardTitle>
            <CardDescription className="space-y-6">
              <div className="space-y-2">
                <Label>Select Hostel</Label>

                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      {selectedHostel?.type ?? "Choose Hostel"}
                    </Button>
                  </DialogTrigger>

                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Select the Hostel Type</DialogTitle>
                      <DialogDescription>Choose one option</DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-2 mt-4">
                      {hostelTypes?.map((hostel) => (
                        <Button
                          key={hostel._id.toString()}
                          variant="ghost"
                          onClick={() => {
                            setSelectedHostel({
                              id: hostel._id,
                              type: hostel.hostel_type,
                            });
                            setOpen(false);
                          }}
                        >
                          {hostel.hostel_type}
                        </Button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {selectedHostel && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Block name"
                    value={blockName}
                    onChange={(e) => setBlockName(e.target.value)}
                  />
                  <Button onClick={handleAddBlock}>Add</Button>
                </div>
              )}

              {selectedHostel && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Row No</TableHead>
                      <TableHead>Block Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBlocks?.map((block: any, index: number) => (
                      <TableRow key={block._id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{block.block_name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardDescription>
          </CardHeader>
        </Card>
      </TabsContent>

      {/* ---------------------- ROOMS TAB ---------------------- */}
<TabsContent value="reports">
  <Card>
    <CardHeader>
      <CardTitle>Rooms</CardTitle>
      <CardDescription className="space-y-6">

        {/* Hostel Selector */}
        <div className="space-y-2">
          <Label>Select Hostel</Label>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                {selectedHostel?.type ?? "Choose Hostel"}
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select the Hostel</DialogTitle>
                <DialogDescription>Choose one option</DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-2 mt-4">
                {hostelTypes?.map((hostel) => (
                  <Button
                    key={hostel._id.toString()}
                    variant="ghost"
                    onClick={() => {
                      setSelectedHostel({
                        id: hostel._id,
                        type: hostel.hostel_type,
                      });
                      setSelectedBlock(null);
                      setSelectedBlockName("");
                      setOpen(false);
                    }}
                  >
                    {hostel.hostel_type}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Show Selected Hostel */}
        {selectedHostel && (
          <div className="text-sm text-muted-foreground">
            Selected Hostel: <b>{selectedHostel.type}</b>
          </div>
        )}

        {/* Block Table */}
        {selectedHostel && !selectedBlock && (
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Block No</TableHead>
                <TableHead>Block Name</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredBlocks?.map((block: any, index: number) => (
                <TableRow
                  key={block._id}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedBlock(block._id);
                    setSelectedBlockName(block.block_name);
                  }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{block.block_name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* When block is selected -> show rooms list + add room */}
        {selectedBlock && (
          <>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Selected Block: <b>{selectedBlockName}</b>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedBlock(null);
                  setSelectedBlockName("");
                }}
              >
                Go Back
              </Button>
            </div>

            {/* Rooms Table */}
   {/* Rooms Table */}
<Table className="mt-4">
  <TableHeader>
    <TableRow>
      <TableHead>Room No</TableHead>
      <TableHead>Capacity</TableHead>
    </TableRow>
  </TableHeader>

  <TableBody>
    {rooms?.map((room: any) => (
      <TableRow key={room._id}>
        <TableCell>{room.room_no}</TableCell>
        <TableCell>{room.capacity}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>

            {/* Add Room Section */}
            <div className="space-y-3 mt-6">
              <Label>Add Room</Label>

              <div className="space-y-2">
                <Label>Room Number</Label>
                <Input
                  placeholder="Room No"
                  value={roomNo}
                  onChange={(e) => setRoomNo(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="Capacity"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                />
              </div>

              <Button onClick={handleAddRoom}>Add Room</Button>
            </div>
          </>
        )}

      </CardDescription>
    </CardHeader>
  </Card>
</TabsContent>

    </Tabs>
    </div>
  );
}
