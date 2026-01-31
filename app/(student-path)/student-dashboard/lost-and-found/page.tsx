"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Id } from "@/convex/_generated/dataModel";

const LostAndFound = () => {
  const posts = useQuery(api.lostItem.getAllLostPosts);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const createLostItemWithLost = useMutation(api.lostItem.createLostItemWithLost);
  const currentStudent = useQuery(api.students.getCurrentStudent);
  const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL as string;
  const markFound = useMutation(api.found.markItemFound);
  

  const [showForm, setShowForm] = useState(false);
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

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
  };

  const handleMarkFound = async (itemId: Id<"lost_item">) => {
  if (!currentStudent) return;

  await markFound({
    student_id: currentStudent._id,
    item_id: itemId, // ✅ correct type
    found_date: new Date().toISOString(),
  });
};

const LostItemImage = ({ imageId }: { imageId: Id<"_storage"> }) => {
  const imageUrl = useQuery(api.files.getFileUrl, {
    storageId: imageId,
  });

  if (!imageUrl) return null;

  return (
    <img
      src={imageUrl}
      className="h-60 w-auto object-cover rounded-md mt-2"
      alt="Lost item"
    />
  );
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

        {posts?.map((post) => {
          const isFound = !!post.found;

          return (
            <Card
              key={post._id}
              className="cursor-pointer"
              onClick={() =>
                setExpandedPostId(expandedPostId === post._id ? null : post._id)
              }
            >
              <CardContent className="p-4 space-y-2">
                {/* Student Name */}
                <p className="font-semibold">
                  {post.student.fname} {post.student.lname}
                </p>

                {/* Lost Item Name */}
                <p
                  className={`mt-1 font-medium ${isFound ? "text-green-600" : "text-red-600"
                    }`}
                >
                  {post.item.item_name}
                </p>

                {/* Image */}
              {post.item.image_id && (
  <LostItemImage imageId={post.item.image_id} />
)}


                {/* Date */}
                <p className="text-xs text-muted-foreground">
                  {new Date(post.date).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>

                {/* Found Info */}
                {isFound && post.found && (
                  <p className="text-xs text-green-600">
                    Found by {post.found.student.fname} {post.found.student.lname} on{" "}
                    {new Date(post.found.found_date).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}

                {/* Mark as Found button */}
                {!post.found && post.student._id !== currentStudent?._id && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation(); // ⛔ prevents card toggle
                      handleMarkFound(post.item._id);
                    }}
                  >
                    Mark as Found
                  </Button>
                )}

                {/* Description (expandable) */}
                {expandedPostId === post._id && (
                  <p className="text-sm mt-2">{post.item.description}</p>
                )}
              </CardContent>
            </Card>
          );
        })}


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
