import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
  /**
  *  Utility funkcija koja spaja dve biblioteke zajedno:
  *  - clsx je biblioteka koja spaja CSS klase zajedno, i pametno handles conditional klase
  *  - tailwind-merge rešava konflikte između Tailwind klasa.
  *
  * Koristi se:
  *  @example
  *  <div className={cn("p-4", isActive && "bg-blue-500", isDisabled && "opacity-50")} />
  *
  *  Treba je koristiti u html-u svuda, ali posebno ako ocekujemo da bude conflikta.
  */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}