"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import type { Dia } from "@/lib/scheduler/types";

export interface CartSession {
  dia: Dia;
  bloque_id: number;
  aula_nombre: string;
}

export interface CartItem {
  courseId: number;
  courseName: string;
  nrc: string;
  profesor: string;
  sesiones: CartSession[];
}

export interface EnrollmentContextType {
  cart: Map<number, CartItem>;
  addNrcToCart: (item: CartItem) => void;
  removeCourseFromCart: (courseId: number) => void;
  clearCart: () => void;
}

const EnrollmentContext = createContext<EnrollmentContextType | null>(null);

export function EnrollmentProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Map<number, CartItem>>(new Map());

  const addNrcToCart = (item: CartItem) => {
    setCart((prev) => {
      const next = new Map(prev);
      next.set(item.courseId, item);
      return next;
    });
  };

  const removeCourseFromCart = (courseId: number) => {
    setCart((prev) => {
      const next = new Map(prev);
      next.delete(courseId);
      return next;
    });
  };

  const clearCart = () => setCart(new Map());

  return (
    <EnrollmentContext.Provider
      value={{ cart, addNrcToCart, removeCourseFromCart, clearCart }}
    >
      {children}
    </EnrollmentContext.Provider>
  );
}

export function useEnrollment() {
  const context = useContext(EnrollmentContext);
  if (!context) {
    throw new Error("useEnrollment must be used within an EnrollmentProvider");
  }
  return context;
}
