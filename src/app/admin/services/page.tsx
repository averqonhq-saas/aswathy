"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Sparkles,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Clock,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  Eye,
  MoveUp,
  MoveDown,
  Image as ImageIcon,
  DollarSign,
  Tag,
  FileText,
  FolderPlus,
} from "lucide-react";
import Drawer from "@/components/admin/Drawer";
import Modal from "@/components/admin/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import type { Service, ServiceCategory } from "@/lib/types";

export default function AdminServicesPage() {
  const { success, error } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Category modal & management state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<ServiceCategory | null>(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Reorder mode
  const [isReordering, setIsReordering] = useState(false);
  const [reorderedList, setReorderedList] = useState<Service[]>([]);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // Service Editor Drawer state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    shortDescription: "",
    fullDescription: "",
    durationMinutes: 50,
    price: 1800,
    image: "",
    status: "active" as "active" | "disabled",
  });
  const [isSavingService, setIsSavingService] = useState(false);

  // Delete confirm dialog state
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Create new category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      error("Please enter a category name.");
      return;
    }
    setIsSavingCategory(true);
    try {
      const res = await fetch("/api/admin/services/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create category");
      success(`Category "${newCategoryName.trim()}" created successfully.`);
      setNewCategoryName("");
      setNewCategoryDescription("");
      if (data.category) {
        setCategories((prev) => [...prev, data.category]);
        setFormData((prev) => ({ ...prev, categoryId: data.category.id }));
      }
      loadServices();
    } catch (err: any) {
      error(err.message || "Failed to create category");
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Delete category
  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    setIsDeletingCategory(true);
    try {
      const res = await fetch(`/api/admin/services/categories?id=${deletingCategory.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete category");
      success(`Category "${deletingCategory.name}" removed.`);
      setDeletingCategory(null);
      loadServices();
    } catch (err: any) {
      error(err.message || "Failed to delete category");
    } finally {
      setIsDeletingCategory(false);
    }
  };

  // Load services and categories
  const loadServices = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/services");
      if (!res.ok) throw new Error("Failed to load services");
      const data = await res.json();
      setServices(data.services || []);
      setCategories(data.categories || []);
      setReorderedList(data.services || []);
    } catch (err: any) {
      error(err.message || "Failed to load clinical services.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  // Filtered Services List
  const filteredServices = useMemo(() => {
    return services.filter((svc) => {
      const matchesSearch =
        svc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        svc.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        svc.categoryName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === "all" || svc.categoryId === selectedCategory;

      const matchesStatus =
        selectedStatus === "all" || svc.status === selectedStatus;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [services, searchQuery, selectedCategory, selectedStatus]);

  // Open Drawer for Add New
  const handleAddNew = () => {
    setEditingService(null);
    setFormData({
      name: "",
      categoryId: categories[0]?.id || "cat_individual",
      shortDescription: "",
      fullDescription: "",
      durationMinutes: 50,
      price: 1800,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD8ua6mDuxmSMyI_u_Z98j_VQSlLAUuZYfhesSiTZ0CziUw9MQwjom-Ogzv2Ls7nHAhgfNAWV2ykB5fNDbwCaXvmUuLtRs0RK9aTJgyDbPqmBHqCxvn7Yl40r1IdxStuWypxfagU0D8IbSAl2Mo7T2hoVgs9cKh0P6ynL0YyOR39OwWi5n2HJyOG6bdOjSNz_5UCef67A5mRWJhTdfcBBN45igdjXsrLWnUCJh2qcmbIFi9sgaMsl-FBg",
      status: "active",
    });
    setIsEditorOpen(true);
  };

  // Open Drawer for Edit
  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      categoryId: service.categoryId,
      shortDescription: service.shortDescription,
      fullDescription: service.fullDescription,
      durationMinutes: service.durationMinutes,
      price: service.price,
      image: service.image,
      status: service.status,
    });
    setIsEditorOpen(true);
  };

  // Toggle Active / Disabled
  const handleToggleStatus = async (service: Service) => {
    const nextStatus = service.status === "active" ? "disabled" : "active";
    try {
      const res = await fetch(`/api/admin/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      success(`"${service.name}" set to ${nextStatus}.`);
      loadServices();
    } catch (err: any) {
      error(err.message || "Failed to toggle status");
    }
  };

  // Save or Create Service
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.shortDescription.trim()) {
      error("Please fill in the required fields.");
      return;
    }

    setIsSavingService(true);
    try {
      if (editingService) {
        // PUT update
        const res = await fetch(`/api/admin/services/${editingService.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Failed to update service");
        success("Service updated successfully.");
      } else {
        // POST create
        const res = await fetch("/api/admin/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Failed to create service");
        success("New service added to practice.");
      }

      setIsEditorOpen(false);
      loadServices();
    } catch (err: any) {
      error(err.message || "Failed to save service");
    } finally {
      setIsSavingService(false);
    }
  };

  // Delete Service
  const handleDeleteService = async () => {
    if (!deletingService) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/services/${deletingService.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete service");
      success(`Service "${deletingService.name}" removed.`);
      setDeletingService(null);
      loadServices();
    } catch (err: any) {
      error(err.message || "Failed to remove service");
    } finally {
      setIsDeleting(false);
    }
  };

  // Move service up/down in reorder list
  const moveService = (index: number, direction: "up" | "down") => {
    const list = [...reorderedList];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    setReorderedList(list);
  };

  // Save new order
  const handleSaveOrder = async () => {
    setIsSavingOrder(true);
    try {
      const orderedIds = reorderedList.map((s) => s.id);
      const res = await fetch("/api/admin/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
      if (!res.ok) throw new Error("Failed to save reorder");
      success("Services order updated.");
      setIsReordering(false);
      loadServices();
    } catch (err: any) {
      error(err.message || "Failed to reorder services");
    } finally {
      setIsSavingOrder(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-playfair text-2xl md:text-3xl font-semibold text-[#1A3828] flex items-center gap-3">
            <span>Clinical Services</span>
            <span className="text-xs font-sans font-medium px-2.5 py-1 rounded-full bg-[#1A3828]/10 text-[#1A3828]">
              {services.length} Total
            </span>
          </h1>
          <p className="text-sm text-[#7B7368] mt-1 font-sans">
            Manage your therapy offerings, pricing, session durations, and display ordering.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (isReordering) {
                setReorderedList(services);
                setIsReordering(false);
              } else {
                setReorderedList(services);
                setIsReordering(true);
              }
            }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-2 shadow-xs ${
              isReordering
                ? "bg-amber-100 border-amber-300 text-amber-900"
                : "border-[#1A3828]/20 bg-white/70 hover:bg-white text-[#1A3828]"
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{isReordering ? "Cancel Reorder" : "Reorder Offerings"}</span>
          </button>

          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-[#1A3828]/20 bg-white/70 hover:bg-white text-[#1A3828] transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Tag className="w-3.5 h-3.5 text-[#1A3828]" />
            <span>Manage Categories</span>
          </button>

          <button
            onClick={handleAddNew}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#1A3828] text-white hover:bg-[#142C1F] transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {/* REORDER BAR IF ACTIVE */}
      {isReordering && (
        <div className="bg-amber-50/90 border border-amber-300/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3 animate-in fade-in">
          <div>
            <h4 className="font-semibold text-sm text-amber-900">Reorder Display Priority</h4>
            <p className="text-xs text-amber-800/80 mt-0.5">
              Use the Up and Down arrows to change how services appear on your public website.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsReordering(false)}
              className="px-3 py-1.5 text-xs font-medium rounded-xl bg-white border border-amber-200 text-amber-900 hover:bg-amber-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveOrder}
              disabled={isSavingOrder}
              className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-[#1A3828] text-white hover:bg-[#142C1F] shadow-xs disabled:opacity-50"
            >
              {isSavingOrder ? "Saving Order..." : "Save Ordering"}
            </button>
          </div>
        </div>
      )}

      {/* FILTER & SEARCH CONTROLS */}
      {!isReordering && (
        <div className="bg-white/80 backdrop-blur-sm border border-[#1A3828]/10 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#7B7368] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search services by title, category, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#1A3828]/15 focus:border-[#1A3828] focus:outline-none bg-white font-sans text-[#1A3828]"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-[#1A3828]/15 bg-white text-[#1A3828] focus:border-[#1A3828] focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-[#1A3828]/15 bg-white text-[#1A3828] focus:border-[#1A3828] focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>
      )}

      {/* SERVICES LIST / GRID */}
      {isLoading ? (
        <div className="bg-white/80 rounded-2xl border border-[#1A3828]/10 p-12 text-center shadow-sm animate-pulse">
          <div className="w-10 h-10 border-3 border-[#1A3828]/20 border-t-[#1A3828] rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-sans text-[#7B7368]">Loading clinical services...</p>
        </div>
      ) : isReordering ? (
        /* REORDER VIEW LIST */
        <div className="bg-white rounded-2xl border border-[#1A3828]/10 shadow-sm divide-y divide-[#1A3828]/10 overflow-hidden">
          {reorderedList.map((svc, idx) => (
            <div key={svc.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#FCF9F2]/50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-[#1A3828]/5 text-[#1A3828] font-bold text-xs flex items-center justify-center">
                  #{idx + 1}
                </span>
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 relative shrink-0">
                  <Image src={svc.image} alt={svc.name} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#1A3828]">{svc.name}</h4>
                  <p className="text-xs text-[#7B7368]">{svc.categoryName} • {svc.durationMinutes}m • ₹{svc.price}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveService(idx, "up")}
                  disabled={idx === 0}
                  className="p-2 rounded-lg border border-[#1A3828]/15 hover:bg-[#1A3828]/10 text-[#1A3828] disabled:opacity-30"
                  title="Move Up"
                >
                  <MoveUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveService(idx, "down")}
                  disabled={idx === reorderedList.length - 1}
                  className="p-2 rounded-lg border border-[#1A3828]/15 hover:bg-[#1A3828]/10 text-[#1A3828] disabled:opacity-30"
                  title="Move Down"
                >
                  <MoveDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#1A3828]/10 p-12 text-center shadow-sm">
          <Sparkles className="w-12 h-12 text-[#1A3828]/20 mx-auto mb-3" />
          <h3 className="font-playfair text-lg font-semibold text-[#1A3828]">No services found</h3>
          <p className="text-xs text-[#7B7368] mt-1">
            Try adjusting your search criteria or create a new therapy offering.
          </p>
          <button
            onClick={handleAddNew}
            className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-[#1A3828] text-white hover:bg-[#142C1F] transition-all"
          >
            Create Service
          </button>
        </div>
      ) : (
        /* STANDARD SERVICE CARDS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((svc) => (
            <div
              key={svc.id}
              className="bg-white rounded-2xl border border-[#1A3828]/10 hover:border-[#1A3828]/25 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Image & Status Badge */}
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                <Image
                  src={svc.image}
                  alt={svc.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/95 text-[#1A3828] shadow-xs">
                    {svc.categoryName}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => handleToggleStatus(svc)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all shadow-xs flex items-center gap-1 ${
                      svc.status === "active"
                        ? "bg-emerald-500 text-white hover:bg-emerald-600"
                        : "bg-slate-500 text-white hover:bg-slate-600"
                    }`}
                    title="Click to toggle status"
                  >
                    {svc.status === "active" ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" /> Disabled
                      </>
                    )}
                  </button>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                  <span className="font-playfair text-lg font-semibold drop-shadow-sm truncate">
                    {svc.name}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <p className="text-xs text-[#7B7368] line-clamp-2 leading-relaxed">
                  {svc.shortDescription}
                </p>

                <div className="pt-3 border-t border-[#1A3828]/5 flex items-center justify-between text-xs text-[#7B7368]">
                  <div className="flex items-center gap-1.5 font-medium text-[#1A3828]">
                    <Clock className="w-3.5 h-3.5 text-[#1A3828]/60" />
                    <span>{svc.durationMinutes} Minutes</span>
                  </div>
                  <div className="font-bold text-sm text-[#1A3828]">₹{svc.price}</div>
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="px-4 py-3 bg-[#FCF9F2]/70 border-t border-[#1A3828]/10 flex items-center justify-between">
                <button
                  onClick={() => handleToggleStatus(svc)}
                  className="text-xs text-[#7B7368] hover:text-[#1A3828] font-medium"
                >
                  {svc.status === "active" ? "Deactivate" : "Activate"}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(svc)}
                    className="p-1.5 rounded-lg border border-[#1A3828]/15 hover:bg-white text-[#1A3828] transition-colors"
                    title="Edit Service"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingService(svc)}
                    className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors"
                    title="Delete Service"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SERVICE EDITOR DRAWER */}
      <Drawer
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingService ? "Edit Clinical Service" : "Create New Service"}
        subtitle="Manage descriptions, duration, pricing, and visual presentation."
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => setIsEditorOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#1A3828]/5 hover:bg-[#1A3828]/10 text-[#1A3828]"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveService}
              disabled={isSavingService}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#1A3828] hover:bg-[#142C1F] text-white transition-all disabled:opacity-50 shadow-sm"
            >
              {isSavingService
                ? "Saving..."
                : editingService
                ? "Update Service"
                : "Create Service"}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveService} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1A3828] mb-1">
              Service Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Compassionate Individual Therapy"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#1A3828]">
                  Category *
                </label>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="text-[11px] font-semibold text-[#1A3828] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Category</span>
                </button>
              </div>
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none bg-white font-sans"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as "active" | "disabled",
                  })
                }
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none bg-white font-sans"
              >
                <option value="active">Active & Available</option>
                <option value="disabled">Disabled / Draft</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Session Duration (Minutes)
              </label>
              <input
                type="number"
                min="15"
                max="180"
                step="5"
                value={formData.durationMinutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    durationMinutes: Number(e.target.value),
                  })
                }
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A3828] mb-1">
                Fee (₹ INR)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
                className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A3828] mb-1">
              Short Summary * (Used in card snippets)
            </label>
            <textarea
              rows={2}
              required
              placeholder="A brief 1-2 sentence description shown on overview cards..."
              value={formData.shortDescription}
              onChange={(e) =>
                setFormData({ ...formData, shortDescription: e.target.value })
              }
              className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none resize-none font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A3828] mb-1">
              Full Clinical Overview (Detailed explanation)
            </label>
            <textarea
              rows={5}
              placeholder="Explain the therapeutic modalities used, who this session is suitable for, and what clients can expect..."
              value={formData.fullDescription}
              onChange={(e) =>
                setFormData({ ...formData, fullDescription: e.target.value })
              }
              className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none resize-none font-sans leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A3828] mb-1">
              Cover Image URL
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none font-sans"
            />
            {formData.image && (
              <div className="mt-2 relative h-28 w-full rounded-xl overflow-hidden border border-[#1A3828]/10 bg-slate-50">
                <Image
                  src={formData.image}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </form>
      </Drawer>

      {/* CONFIRM DELETE SERVICE DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(deletingService)}
        title="Remove Service"
        message={`Are you sure you want to remove "${deletingService?.name}"? It will no longer be visible on your website or booking system.`}
        confirmText="Delete Service"
        isDestructive={true}
        onConfirm={handleDeleteService}
        onClose={() => setDeletingService(null)}
      />

      {/* MANAGE CATEGORIES MODAL */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Manage Service Categories"
        subtitle="Create, categorize, and organize your clinical therapy domains."
        maxWidth="lg"
      >
        <div className="p-6 space-y-6">
          {/* Add New Category Form */}
          <form
            onSubmit={handleCreateCategory}
            className="bg-[#FCF9F2] p-4 rounded-2xl border border-[#1A3828]/15 space-y-3"
          >
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1A3828] flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-[#1A3828]" />
              <span>Add New Category</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#1A3828] mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Trauma & Resilience"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none bg-white font-sans text-[#1A3828]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#1A3828] mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Evidence-based somatic recovery"
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#1A3828]/20 focus:border-[#1A3828] focus:outline-none bg-white font-sans text-[#1A3828]"
                />
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSavingCategory || !newCategoryName.trim()}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#1A3828] text-white hover:bg-[#142C1F] transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isSavingCategory ? "Adding..." : "Add Category"}</span>
              </button>
            </div>
          </form>

          {/* Existing Categories List */}
          <div>
            <h4 className="text-xs font-semibold text-[#1A3828] mb-3">
              Existing Categories ({categories.length})
            </h4>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const serviceCount = services.filter((s) => s.categoryId === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className="p-3.5 rounded-xl border border-[#1A3828]/10 bg-white flex items-center justify-between gap-3 hover:border-[#1A3828]/20 transition-all"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#1A3828] truncate">
                          {cat.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1A3828]/10 text-[#1A3828] font-medium">
                          {serviceCount} {serviceCount === 1 ? "service" : "services"}
                        </span>
                      </div>
                      {cat.description && (
                        <p className="text-[11px] text-[#7B7368] mt-0.5 line-clamp-1">
                          {cat.description}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setDeletingCategory(cat)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>

      {/* CONFIRM DELETE CATEGORY DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(deletingCategory)}
        title="Delete Category"
        message={`Are you sure you want to delete the category "${deletingCategory?.name}"? You can only delete categories that currently have no associated services.`}
        confirmText="Delete Category"
        isDestructive={true}
        onConfirm={handleDeleteCategory}
        onClose={() => setDeletingCategory(null)}
      />
    </div>
  );
}
