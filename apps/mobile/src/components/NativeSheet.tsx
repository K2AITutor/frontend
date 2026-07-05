import React, { useEffect, useMemo, useRef } from "react";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { Text, useCSSVariable, View } from "../tw";

export function NativeSheet({
  open,
  title,
  children,
  onDismiss,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onDismiss: () => void;
}) {
  const ref = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["35%", "65%"], []);
  const background = useCSSVariable("--color-card");

  useEffect(() => {
    if (open) ref.current?.present();
    else ref.current?.dismiss();
  }, [open]);

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      onDismiss={onDismiss}
      backgroundStyle={{ backgroundColor: background }}
      handleIndicatorStyle={{ backgroundColor: "rgba(148, 163, 184, 0.7)" }}
    >
      <BottomSheetView>
        <View className="p-6">
          <Text className="mb-4 text-xl font-bold text-foreground">{title}</Text>
          {children}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
