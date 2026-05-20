// ========================================
// FUTURE API SERVICE
// Handles collection-related API requests
// ========================================

// GET /api/collections
export async function getCollections() {
  // const response = await fetch("/api/collections");
  // return response.json();

  return [];
}

// GET /api/collections/:id
export async function getCollectionById(id) {
  // const response = await fetch(`/api/collections/${id}`);
  // return response.json();

  return null;
}

// POST /api/collections
export async function createCollection(collectionData) {
  // const response = await fetch("/api/collections", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(collectionData),
  // });
  // return response.json();

  return collectionData;
}

// PUT /api/collections/:id
export async function updateCollection(id, collectionData) {
  // const response = await fetch(`/api/collections/${id}`, {
  //   method: "PUT",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(collectionData),
  // });
  // return response.json();

  return { id, ...collectionData };
}

// DELETE /api/collections/:id
export async function deleteCollection(id) {
  // await fetch(`/api/collections/${id}`, {
  //   method: "DELETE",
  // });

  return id;
}