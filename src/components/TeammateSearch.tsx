"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { UserProfile } from "@/lib/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface TeammateSearchProps {
  tournamentId: string;
  currentUserId: string;
  onTeammateSelected: (userId: string, profile: UserProfile) => void;
  selectedTeammateId?: string | null;
}

export default function TeammateSearch({
  tournamentId,
  currentUserId,
  onTeammateSelected,
  selectedTeammateId,
}: TeammateSearchProps) {
  const supabase = createClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search for users by name or email
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const query = searchQuery.toLowerCase();
      
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
        .neq("id", currentUserId) // Exclude current user
        .limit(10);

      if (error) throw error;

      setSearchResults(data || []);
      
      if (!data || data.length === 0) {
        setError("No users found matching your search");
      }
    } catch (err: any) {
      setError(err.message || "Search failed");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle teammate selection
  const handleSelectTeammate = (profile: UserProfile) => {
    setSelectedProfile(profile);
    onTeammateSelected(profile.id, profile);
    setSearchResults([]);
    setSearchQuery("");
  };

  // Load selected teammate if passed as prop
  useEffect(() => {
    if (selectedTeammateId && !selectedProfile) {
      const loadProfile = async () => {
        const { data } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", selectedTeammateId)
          .single();
        
        if (data) {
          setSelectedProfile(data);
        }
      };
      loadProfile();
    }
  }, [selectedTeammateId]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-12 font-semibold text-foreground mb-2">
          Search for Teammate
        </label>
        <p className="text-10 text-muted mb-3">
          Your teammate must have an existing account. Search by name or email.
        </p>

        <div className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by name or email..."
            disabled={loading || !!selectedProfile}
          />
          <Button
            onClick={handleSearch}
            variant="primary"
            size="sm"
            isLoading={loading}
            disabled={!!selectedProfile}
          >
            Search
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-warning/10 border border-warning/30 text-warning px-4 py-3 rounded-lg text-12">
          {error}
        </div>
      )}

      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="bg-surface border border-border rounded-lg divide-y">
          <div className="px-4 py-2 bg-surface-2">
            <p className="text-10 font-semibold text-muted">Search Results</p>
          </div>
          {searchResults.map((profile) => (
            <div
              key={profile.id}
              className="flex items-center justify-between p-3 hover:bg-surface-2 cursor-pointer"
              onClick={() => handleSelectTeammate(profile)}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                {profile.avatar_url && (
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white border border-border">
                    <img
                      src={profile.avatar_url}
                      alt={profile.first_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Info */}
                <div>
                  <p className="text-12 font-semibold text-foreground">
                    {profile.first_name} {profile.last_name}
                  </p>
                  <p className="text-10 text-muted">{profile.email}</p>
                </div>
              </div>

              <Button variant="outline" size="sm">
                Select
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Selected teammate */}
      {selectedProfile && (
        <div className="bg-accent/bg border border-accent/40 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Avatar */}
                {selectedProfile.avatar_url && (
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white border-2 border-accent">
                  <img
                    src={selectedProfile.avatar_url}
                    alt={selectedProfile.first_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* Info */}
                <div>
                <p className="text-10 font-medium text-accent uppercase">Selected Teammate</p>
                <p className="text-12 font-bold text-foreground">
                  {selectedProfile.first_name} {selectedProfile.last_name}
                </p>
                <p className="text-10 text-muted">{selectedProfile.email}</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedProfile(null);
                onTeammateSelected("", null as any);
              }}
            >
              Change
            </Button>
          </div>

          <div className="mt-3 pt-3 border-t border-accent/40">
            <p className="text-10 text-accent">
              ✓ An invitation will be sent to this user to confirm the team formation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
