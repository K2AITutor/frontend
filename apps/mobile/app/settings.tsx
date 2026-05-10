import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "../src/tw";
import { useRouter } from "expo-router";
import { ChevronLeft, User, Lock, Palette, Bell, CreditCard, ChevronRight, Save } from "lucide-react-native";
import apiClient from "../src/lib/apiClient";

export default function SettingsScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await apiClient.get("/auth/me");
        setProfile(res.data.profile);
      } catch (err) {
        console.error("Profile load failed", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  if (isLoading) return <View className="flex-1 bg-background" />;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="pt-14 pb-6 px-6 bg-card border-b border-border flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-4">
          <ChevronLeft size={24} color="#14b8a6" />
        </Pressable>
        <Text className="text-xl font-bold text-foreground">Settings</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Profile Summary */}
        <View className="p-6 items-center border-b border-border bg-card/30">
          <View className="w-24 h-24 rounded-full bg-primary/20 items-center justify-center mb-4 border-2 border-primary/30">
             <Text className="text-3xl font-bold text-primary">
               {profile?.name?.split(' ').map((n: string) => n[0]).join('')}
             </Text>
          </View>
          <Text className="text-xl font-bold text-foreground">{profile?.name}</Text>
          <Text className="text-sm text-muted-foreground">{profile?.email}</Text>
        </View>

        <View className="p-6 space-y-2">
          <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 ml-1">Account</Text>
          
          <SettingsLink icon={User} label="Personal Information" />
          <SettingsLink icon={Lock} label="Security & Password" />
          <SettingsLink icon={CreditCard} label="Subscription Plan" onPress={() => router.push('/subscription')} />
          
          <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-6 mb-2 ml-1">Preferences</Text>
          
          <SettingsLink icon={Palette} label="Appearance" sublabel="Dark Mode" />
          <SettingsLink icon={Bell} label="Notifications" />
        </View>

        <View className="p-6">
           <Pressable className="bg-primary flex-row items-center justify-center py-4 rounded-2xl shadow-lg">
             <Save size={20} color="#fff" />
             <Text className="ml-2 text-white font-bold">Save All Changes</Text>
           </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function SettingsLink({ icon: Icon, label, sublabel, onPress }: any) {
  return (
    <Pressable 
      onPress={onPress}
      className="flex-row items-center justify-between bg-card p-4 rounded-2xl border border-border mb-2 active:bg-muted"
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-xl bg-muted items-center justify-center mr-3">
          <Icon size={18} color="#94a3b8" />
        </View>
        <View>
          <Text className="font-semibold text-foreground">{label}</Text>
          {sublabel && <Text className="text-xs text-muted-foreground">{sublabel}</Text>}
        </View>
      </View>
      <ChevronRight size={18} color="#475569" />
    </Pressable>
  );
}
