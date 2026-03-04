"use client";

import { Avatar } from "@/lib/types";
import { useMemo } from "react";
import { Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface AvatarSelectorProps {
  avatars: Avatar[];
  selectedAvatarId?: string | null;
  onSelectAvatar: (avatarId: string) => void;
  showCategories?: boolean;
}

export default function AvatarSelector({
  avatars,
  selectedAvatarId,
  onSelectAvatar,
  showCategories = true,
}: AvatarSelectorProps) {
  const { t, isRTL } = useLanguage();
  
  // Group avatars by category
  const groupedAvatars = useMemo(() => {
    if (!showCategories) {
      return { all: avatars };
    }
    const groups: { [key: string]: Avatar[] } = {};
    avatars.forEach((avatar) => {
      const category = avatar.category || "player";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(avatar);
    });
    return groups;
  }, [avatars, showCategories]);

  const categoryLabels: Record<string, string> = {
    legend: t("avatar.categories.legend"),
    current: t("avatar.categories.current"),
    player: t("avatar.categories.player"),
    all: t("avatar.categories.all"),
  };

  return (
    <div style={{ width: "100%" }}>
      {Object.entries(groupedAvatars).map(([category, categoryAvatars]) => (
        <div key={category} style={{ marginBottom: "24px" }}>
          {showCategories && (
            <h4 
              style={{ 
                fontSize: "14px", 
                fontWeight: 700, 
                color: "#64748B", 
                marginBottom: "12px", 
                textAlign: isRTL ? "right" : "left" 
              }}
              dir={isRTL ? "rtl" : "ltr"}
            >
              {categoryLabels[category] || category}
            </h4>
          )}

          {/* Grid: 2 cols mobile, 3 cols sm, 4 cols md, 6 cols lg */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: "16px",
            }}
            className="!grid-cols-2 sm:!grid-cols-3 md:!grid-cols-4 lg:!grid-cols-6"
          >
            {categoryAvatars.map((avatar) => {
              const isSelected = selectedAvatarId === avatar.id;
              
              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => onSelectAvatar(avatar.id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px",
                    borderRadius: "12px",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#F8FAFC";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {/* Avatar Image - Square 88x88px */}
                  <div
                    style={{
                      position: "relative",
                      width: "88px",
                      height: "88px",
                      borderRadius: "12px",
                      overflow: "hidden",
                      flexShrink: 0,
                      border: isSelected ? "3px solid #005CFF" : "2px solid #E2E8F0",
                      background: isSelected 
                        ? "linear-gradient(135deg, #EEF4FF 0%, #DDE8FF 100%)" 
                        : "linear-gradient(135deg, #FAFBFC 0%, #F1F5F9 100%)",
                      boxShadow: isSelected 
                        ? "0 4px 20px rgba(0, 92, 255, 0.3)" 
                        : "0 2px 8px rgba(0, 0, 0, 0.05)",
                      transform: isSelected ? "scale(1.05)" : "scale(1)",
                      transition: "all 0.2s",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={avatar.image_url}
                      alt={avatar.display_name || avatar.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatar.id}`;
                      }}
                    />
                    
                    {/* Selection checkmark */}
                    {isSelected && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(0, 92, 255, 0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background: "#005CFF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                          }}
                        >
                          <Check style={{ width: "16px", height: "16px", color: "white" }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Avatar Name - BELOW image, centered, single line */}
                  <span 
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      textAlign: "center",
                      color: isSelected ? "#005CFF" : "#64748B",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "96px",
                      display: "block",
                    }}
                    title={avatar.display_name || avatar.name}
                  >
                    {avatar.display_name || avatar.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
