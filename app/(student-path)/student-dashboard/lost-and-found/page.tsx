"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const LostAndFound = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const posts = useQuery(api.lostItem.getAllLostPosts, { key: refreshKey });
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const createLostItemWithLost = useMutation(api.lostItem.createLostItemWithLost);
  const currentStudent = useQuery(api.students.getCurrentStudent);

  const [showForm, setShowForm] = useState(false);
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const uploadImage = async (file: File) => {
    const uploadUrl = await generateUploadUrl();
    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await res.json();
    return storageId;
  };

  const handleSubmit = async () => {
    if (!itemName || !description || !currentStudent) return;
    setLoading(true);

    const imageId = file ? await uploadImage(file) : undefined;

    await createLostItemWithLost({
      item_name: itemName,
      description,
      image_id: imageId,
      student_id: currentStudent._id, // ✅ correct type
    });

    // Reset form
    setItemName("");
    setDescription("");
    setFile(null);
    setShowForm(false);
    setLoading(false);

    // Refresh feed
    setRefreshKey((prev) => prev + 1);
  };



  return (
    <div className="min-h-screen p-6 space-y-6">

      {/* Post button */}
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(true)}>+ Post Lost Item</Button>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {posts?.length === 0 && (
          <p className="text-center text-muted-foreground">
            No current posts
          </p>
        )}

        {posts?.map((post) => (
          <Card key={post._id}>
            <CardContent className="p-4 space-y-1">
              <p className="font-semibold">
                {post.student.fname} {post.student.lname}
              </p>
              <p className="text-xs text-muted-foreground">{post.date}</p>
              <p className="mt-2 font-medium">{post.item.item_name}</p>
              <p className="text-sm">{post.item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowForm(false)}
        >
          <Card
            className="w-full max-w-md rounded-2xl shadow-xl border bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="space-y-1 pb-4">
              <h1 className="text-xl font-semibold text-center">
                Report Lost Item
              </h1>
              <p className="text-sm text-muted-foreground text-center">
                Provide as much detail as possible to help recovery
              </p>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Item Name */}
              <div className="space-y-1">
                <Label>
                  Item Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="e.g. Black Wallet"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea
                  placeholder="Where you last saw it, identifying features, etc."
                  className="resize-none"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-1">
                <Label>Upload Image</Label>

                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept="image/*"
                    className="cursor-pointer"
                    onChange={(e) =>
                      setFile(e.target.files?.[0] || null)
                    }
                  />
                  {file && (
                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                      {file.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Submit */}
              <Button
                className="w-full transition-all"
                onClick={handleSubmit}
                disabled={loading || !itemName}
              >
                {loading ? "Posting..." : "Post Report"}
              </Button>
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
};

export default LostAndFound;
