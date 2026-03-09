"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import SportCard from "@/components/ui/SportCard";
import SportButton from "@/components/ui/SportButton";
import SafeImage from "@/components/SafeImage";
import UploadAvatarForm from "./UploadAvatarForm";
import AvatarCardActions from "./AvatarCardActions";
import { useLanguage } from "@/lib/i18n";
import type { Avatar } from "@/lib/types";

interface AvatarManagementClientProps {
  avatars: Avatar[];
  grouped: Record<string, Avatar[]>;
}

export default function AvatarManagementClient({ avatars, grouped }: AvatarManagementClientProps) {
  const { t } = useLanguage();
  const [showUploadModal, setShowUploadModal] = useState(false);

  return (
    <>
      {/* Upload Button - Using SportButton for consistent system styling */}
      <div className="flex justify-center">
        <SportButton
          variant="primary"
          size="base"
          icon={Plus}
          onClick={() => setShowUploadModal(true)}
        >
          {t("admin.avatars.addNew")}
        </SportButton>
      </div>

      {/* Avatars Grid */}
      {avatars.length === 0 ? (
        <SportCard padding="lg" variant="elevated" className="text-center">
          <div className="py-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-surface-2 flex items-center justify-center">
              <Plus className="w-10 h-10 text-muted" />
            </div>
            <p className="text-lg font-semibold text-foreground">{t("admin.avatars.noAvatarsYet")}</p>
            <p className="text-sm text-muted mt-2">{t("admin.avatars.clickToAdd")}</p>
          </div>
        </SportCard>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, list]) => (
            <div key={category} className="space-y-4">
              <h2 className="text-sm font-extrabold text-muted uppercase tracking-[0.2em] text-right">
                {category === "legend" ? t("admin.avatars.legendCategory") : t("admin.avatars.playerCategory")}
              </h2>
              <SportCard padding="lg" variant="default" className="bg-white/80">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                  {list.map((avatar) => (
                    <div
                      key={avatar.id}
                      className="group flex flex-col rounded-xl bg-surface-2 hover:bg-surface border border-border/60 hover:border-primary/40 transition-all duration-200 overflow-hidden"
                    >
                      {/* Avatar Image Container */}
                      <div className="relative aspect-square bg-white">
                        <SafeImage
                          src={avatar.image_url}
                          alt={avatar.display_name}
                          fallbackSeed={avatar.id}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Info + Actions Row */}
                      <div className="p-3 space-y-2">
                        <div className="text-center">
                          <p className="text-xs font-bold text-foreground truncate">
                            {avatar.name}
                          </p>
                          <p className="text-[10px] text-muted truncate">
                            {avatar.display_name}
                          </p>
                        </div>
                        
                        {/* Action Buttons - Clean row below text */}
                        <AvatarCardActions avatar={avatar} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-xl font-bold text-foreground">{t("admin.avatars.uploadNew")}</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 rounded-lg hover:bg-surface transition-colors"
              >
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <UploadAvatarForm
                onSuccess={() => setShowUploadModal(false)}
                onCancel={() => setShowUploadModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    
    </>
  );
}
