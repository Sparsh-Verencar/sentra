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
  CardContent,
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
import { Building2, Layers, DoorOpen, ChevronLeft, Plus, LogOut } from "lucide-react";

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
    setBoysHostel("");
    setGirlsHostel("");
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

  // ---- ROOMS TAB STATES
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

  // ADMIN LOGOUT
  const handleAdminLogout = async () => {
    await signOut();
    router.push("/Staff_and_Students_Login");
  };

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* ---------------- ADMIN INFO HEADER ---------------- */}
        <Card className="shadow-lg bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold text-white">
                  Welcome, {admin?.admin_name || "Admin"}
                </CardTitle>
                <CardDescription className="space-y-1.5 text-base">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">Email:</span>
                    <span className="font-medium text-zinc-200">{admin?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">Organisation:</span>
                    <span className="font-medium text-zinc-200">{admin?.organisation_name}</span>
                  </div>
                </CardDescription>
              </div>

              <Button 
                variant="destructive" 
                onClick={handleAdminLogout}
                className="self-start sm:self-center bg-red-600 hover:bg-red-700"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* ---------------- MAIN TABS ---------------- */}
        <Card className="shadow-lg bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <Tabs defaultValue="Hostel" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-zinc-800 border-zinc-700">
                <TabsTrigger value="Hostel" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-black">
                  <Building2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Hostels</span>
                </TabsTrigger>
                <TabsTrigger value="Block" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-black">
                  <Layers className="h-4 w-4" />
                  <span className="hidden sm:inline">Blocks</span>
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-black">
                  <DoorOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Rooms</span>
                </TabsTrigger>
              </TabsList>

              {/* ---------------------- HOSTEL TAB ---------------------- */}
              <TabsContent value="Hostel" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Enter Hostel Details
                  </h3>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label htmlFor="boys" className="text-sm font-medium text-zinc-200">
                        Boys Hostel Name
                      </Label>
                      <Input
                        id="boys"
                        placeholder="Enter boys hostel name"
                        value={boysHostel}
                        onChange={(e) => setBoysHostel(e.target.value)}
                        className="h-11 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="girls" className="text-sm font-medium text-zinc-200">
                        Girls Hostel Name
                      </Label>
                      <Input
                        id="girls"
                        placeholder="Enter girls hostel name"
                        value={girlsHostel}
                        onChange={(e) => setGirlsHostel(e.target.value)}
                        className="h-11 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleSave} 
                    className="mt-6 w-full sm:w-auto bg-white text-black hover:bg-zinc-200"
                    disabled={!boysHostel && !girlsHostel}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Save Hostels
                  </Button>
                </div>

                {/* Display existing hostels */}
                {hostelTypes && hostelTypes.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-zinc-800">
                    <h4 className="text-sm font-semibold text-zinc-300 mb-4">
                      Existing Hostels
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {hostelTypes.map((hostel) => (
                        <div
                          key={hostel._id.toString()}
                          className="p-4 rounded-lg border border-zinc-800 bg-zinc-800/50"
                        >
                          <div className="font-medium text-white capitalize">
                            {hostel.hostel_type}
                          </div>
                          <div className="text-sm text-zinc-400 mt-1">
                            {hostel.hostel_name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* ---------------------- BLOCK TAB ---------------------- */}
              <TabsContent value="Block" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Manage Blocks
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block text-zinc-200">
                        Select Hostel
                      </Label>
                      <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full sm:w-auto justify-start bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white">
                            <Building2 className="mr-2 h-4 w-4" />
                            {selectedHostel?.type ? (
                              <span className="capitalize">{selectedHostel.type}</span>
                            ) : (
                              "Choose Hostel"
                            )}
                          </Button>
                        </DialogTrigger>

                        <DialogContent className="bg-zinc-900 border-zinc-800">
                          <DialogHeader>
                            <DialogTitle className="text-white">Select Hostel Type</DialogTitle>
                            <DialogDescription className="text-zinc-400">
                              Choose which hostel to manage blocks for
                            </DialogDescription>
                          </DialogHeader>

                          <div className="grid gap-2 mt-4">
                            {hostelTypes?.map((hostel) => (
                              <Button
                                key={hostel._id.toString()}
                                variant="outline"
                                className="justify-start bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white"
                                onClick={() => {
                                  setSelectedHostel({
                                    id: hostel._id,
                                    type: hostel.hostel_type,
                                  });
                                  setOpen(false);
                                }}
                              >
                                <Building2 className="mr-2 h-4 w-4" />
                                <span className="capitalize">{hostel.hostel_type}</span>
                              </Button>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {selectedHostel && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter block name"
                          value={blockName}
                          onChange={(e) => setBlockName(e.target.value)}
                          className="flex-1 h-11 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                        />
                        <Button 
                          onClick={handleAddBlock}
                          disabled={!blockName}
                          className="bg-white text-black hover:bg-zinc-200"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {selectedHostel && filteredBlocks && filteredBlocks.length > 0 && (
                  <div className="rounded-lg border border-zinc-800 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-zinc-800 border-zinc-700 hover:bg-zinc-800">
                          <TableHead className="w-24 text-zinc-300">No.</TableHead>
                          <TableHead className="text-zinc-300">Block Name</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBlocks.map((block: any, index: number) => (
                          <TableRow key={block._id} className="border-zinc-800 hover:bg-zinc-800/50">
                            <TableCell className="font-medium text-white">{index + 1}</TableCell>
                            <TableCell className="text-zinc-200">{block.block_name}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {selectedHostel && (!filteredBlocks || filteredBlocks.length === 0) && (
                  <div className="text-center py-8 text-zinc-500">
                    No blocks added yet. Add your first block above.
                  </div>
                )}
              </TabsContent>

              {/* ---------------------- ROOMS TAB ---------------------- */}
              <TabsContent value="reports" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Manage Rooms
                  </h3>

                  {/* Hostel Selector */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block text-zinc-200">
                        Select Hostel
                      </Label>
                      <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full sm:w-auto justify-start bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white">
                            <Building2 className="mr-2 h-4 w-4" />
                            {selectedHostel?.type ? (
                              <span className="capitalize">{selectedHostel.type}</span>
                            ) : (
                              "Choose Hostel"
                            )}
                          </Button>
                        </DialogTrigger>

                        <DialogContent className="bg-zinc-900 border-zinc-800">
                          <DialogHeader>
                            <DialogTitle className="text-white">Select Hostel</DialogTitle>
                            <DialogDescription className="text-zinc-400">
                              Choose which hostel to manage rooms for
                            </DialogDescription>
                          </DialogHeader>

                          <div className="grid gap-2 mt-4">
                            {hostelTypes?.map((hostel) => (
                              <Button
                                key={hostel._id.toString()}
                                variant="outline"
                                className="justify-start bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white"
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
                                <Building2 className="mr-2 h-4 w-4" />
                                <span className="capitalize">{hostel.hostel_type}</span>
                              </Button>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>

                {/* Block Selection Table */}
                {selectedHostel && !selectedBlock && (
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-300 mb-3">
                      Select a Block
                    </h4>
                    {filteredBlocks && filteredBlocks.length > 0 ? (
                      <div className="rounded-lg border border-zinc-800 overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-zinc-800 border-zinc-700 hover:bg-zinc-800">
                              <TableHead className="w-24 text-zinc-300">No.</TableHead>
                              <TableHead className="text-zinc-300">Block Name</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredBlocks.map((block: any, index: number) => (
                              <TableRow
                                key={block._id}
                                className="cursor-pointer border-zinc-800 hover:bg-zinc-800/50 transition-colors"
                                onClick={() => {
                                  setSelectedBlock(block._id);
                                  setSelectedBlockName(block.block_name);
                                }}
                              >
                                <TableCell className="font-medium text-white">{index + 1}</TableCell>
                                <TableCell className="text-zinc-200">{block.block_name}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-zinc-500">
                        No blocks available. Please add blocks first.
                      </div>
                    )}
                  </div>
                )}

                {/* Room Management */}
                {selectedBlock && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                      <div>
                        <div className="text-sm text-zinc-400">Selected Block</div>
                        <div className="font-semibold text-white mt-1">
                          {selectedBlockName}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBlock(null);
                          setSelectedBlockName("");
                        }}
                        className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white"
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Go Back
                      </Button>
                    </div>

                    {/* Rooms Table */}
                    {rooms && rooms.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-300 mb-3">
                          Existing Rooms
                        </h4>
                        <div className="rounded-lg border border-zinc-800 overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-zinc-800 border-zinc-700 hover:bg-zinc-800">
                                <TableHead className="text-zinc-300">Room No</TableHead>
                                <TableHead className="text-zinc-300">Capacity</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {rooms.map((room: any) => (
                                <TableRow key={room._id} className="border-zinc-800 hover:bg-zinc-800/50">
                                  <TableCell className="font-medium text-white">{room.room_no}</TableCell>
                                  <TableCell className="text-zinc-200">{room.capacity} persons</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}

                    {/* Add Room Form */}
                    <div className="bg-zinc-800/50 rounded-lg p-6 space-y-4 border border-zinc-800">
                      <h4 className="font-semibold text-white">Add New Room</h4>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="roomNo" className="text-sm font-medium text-zinc-200">
                            Room Number
                          </Label>
                          <Input
                            id="roomNo"
                            placeholder="e.g., 101"
                            value={roomNo}
                            onChange={(e) => setRoomNo(e.target.value)}
                            className="h-11 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="capacity" className="text-sm font-medium text-zinc-200">
                            Capacity
                          </Label>
                          <Input
                            id="capacity"
                            type="number"
                            min={1}
                            placeholder="Number of persons"
                            value={capacity}
                            onChange={(e) => setCapacity(Number(e.target.value))}
                            className="h-11 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                          />
                        </div>
                      </div>

                      <Button 
                        onClick={handleAddRoom} 
                        className="w-full sm:w-auto bg-white text-black hover:bg-zinc-200"
                        disabled={!roomNo || capacity < 1}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Room
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* ---------------- NEXT BUTTON ---------------- */}
        <div className="flex justify-end">
          <Button 
            onClick={() => router.push('/Onboarding_Roles')}
            className="bg-white text-black hover:bg-zinc-200"
            size="lg"
          >
            Next
            <ChevronLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        </div>

      </div>
    </div>
  );
}