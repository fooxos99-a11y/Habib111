"use client"

import type React from "react"

import { create } from "zustand"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DialogStore {
  confirm: {
    isOpen: boolean
    title: string
    message: string
    confirmText: string
    cancelText: string
    onConfirm?: () => void
    onCancel?: () => void
  }
  alert: {
    isOpen: boolean
    title: string
    message: string
    onClose?: () => void
  }
}

const useDialogStore = create<DialogStore>((set) => ({
  confirm: {
    isOpen: false,
    title: "",
    message: "",
    confirmText: "حسناً",
    cancelText: "لا",
    onConfirm: undefined,
    onCancel: undefined,
  },
  alert: {
    isOpen: false,
    title: "",
    message: "",
    onClose: undefined,
  },
}))

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const { confirm, alert } = useDialogStore()

  const handleConfirm = () => {
    confirm.onConfirm?.()
    useDialogStore.setState((state) => ({
      ...state,
      confirm: { ...state.confirm, isOpen: false },
    }))
  }

  const handleCancel = () => {
    confirm.onCancel?.()
    useDialogStore.setState((state) => ({
      ...state,
      confirm: { ...state.confirm, isOpen: false },
    }))
  }

  const handleAlertClose = () => {
    alert.onClose?.()
    useDialogStore.setState((state) => ({
      ...state,
      alert: { ...state.alert, isOpen: false },
    }))
  }

  return (
    <>
      {children}
      {/* Confirmation Dialog */}
      <AlertDialog open={confirm.isOpen} onOpenChange={(open) => !open && handleCancel()}>
        <AlertDialogContent className="sm:max-w-[500px] border-2 border-[#D4AF37]/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-[#1a2332] mb-2">{confirm.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-lg text-[#1a2332]/80">{confirm.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-3 mt-4">
            <AlertDialogCancel
              onClick={handleCancel}
              className="font-bold text-base border-2 border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-all px-6 py-2"
            >
              {confirm.cancelText}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-gradient-to-r from-[#D4AF37] to-[#C9A961] hover:from-[#C9A961] hover:to-[#BFA050] text-[#023232] font-bold text-base shadow-md hover:shadow-lg transition-all px-6 py-2"
            >
              {confirm.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog */}
      <AlertDialog open={alert.isOpen} onOpenChange={(open) => !open && handleAlertClose()}>
        <AlertDialogContent className="sm:max-w-[500px] border-2 border-[#D4AF37]/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-[#1a2332] mb-2">{alert.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-lg text-[#1a2332]/80 whitespace-pre-line">
              {alert.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogAction
              onClick={handleAlertClose}
              className="bg-gradient-to-r from-[#D4AF37] to-[#C9A961] hover:from-[#C9A961] hover:to-[#BFA050] text-[#023232] font-bold text-base w-full shadow-md hover:shadow-lg transition-all py-2"
            >
              حسناً
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

interface ConfirmDialogOptions {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
}

export function useConfirmDialog() {
  return (options: string | ConfirmDialogOptions, fallbackTitle?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // Handle both string and object formats
      const config =
        typeof options === "string"
          ? {
              title: fallbackTitle || "تأكيد العملية",
              message: options,
              confirmText: "حسناً",
              cancelText: "لا",
            }
          : {
              title: options.title || "تأكيد العملية",
              message: options.description || "",
              confirmText: options.confirmText || "حسناً",
              cancelText: options.cancelText || "لا",
            }

      useDialogStore.setState((state) => ({
        ...state,
        confirm: {
          ...config,
          isOpen: true,
          onConfirm: () => resolve(true),
          onCancel: () => resolve(false),
        },
      }))
    })
  }
}

export function useAlertDialog() {
  return (message: string, title = "تنبيه"): Promise<void> => {
    return new Promise((resolve) => {
      useDialogStore.setState((state) => ({
        ...state,
        alert: {
          isOpen: true,
          title,
          message,
          onClose: () => resolve(),
        },
      }))
    })
  }
}
