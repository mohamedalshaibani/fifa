"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import SportCard from "@/components/ui/SportCard";
import SafeImage from "@/components/SafeImage";
import UploadAvatarForm from "./UploadAvatarForm";
import AvatarCardActions from "./AvatarCardActions";
import type { Avatar } from "@/lib/types";

interface AvatarManagementClientProps {
  avatars: Avatar[];
  grouped: Record<string, Avatar[]>;
}

export default function AvatarManagementClient({ avatars, grouped }: AvatarManagementClientProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);

  return (
    <>
      {/* Upload Button */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          إضافة صورة رمزية جديدة
        </button>
      </div>

      {/* Avatars Grid */}
      {avatars.length === 0 ? (
        <SportCard padding="lg" variant="elevated" className="text-center">
          <p className="text-lg text-muted">لا توجد صور رمزية بعد.</p>
          <p className="text-sm text-muted mt-2">اضغط على الزر أعلاه لإضافة أول صورة.</p>
        </SportCard>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, list]) => (
            <div key={category} className="space-y-3">
              <h2 className="text-sm font-extrabold text-muted uppercase tracking-[0.2em] text-right">
                {category === "legend" ? "فئة الأساطير" : "فئة اللاعبين"}
              </h2>
              <SportCard padding="lg" variant="default" className="bg-white/80">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {list.map((avatar) => (
                    <div
                      key={avatar.id}
                      className="group relative flex flex-col items-center p-3 rounded-xl bg-surface-2 hover:bg-surface border border-border/60 hover:border-primary/40 transition-all duration-200"
                    >
                      {/* Action Buttons */}
                      <AvatarCardActions avatar={avatar} />
                      
                      <div className="relative w-20 h-20 mb-2 rounded-xl overflow-hidden bg-white border border-border">
                        <SafeImage
                          src={avatar.image_url}
                          alt={avatar.display_name}
                          fallbackSeed={avatar.id}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-full text-center">
                        <p className="text-xs font-bold text-foreground truncate">
                          {avatar.name}
                        </p>
                        <p className="text-[10px] text-muted truncate">
                          {avatar.display_name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </SportCard>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">رفع صورة رمزية جديدة</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 rounded-lg hover:bg-surface transition-colors"
              >
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>
            <UploadAvatarForm
              onSuccess={() => setShowUploadModal(false)}
              onCancel={() => setShowUploadModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
