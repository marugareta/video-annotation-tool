// "use client";

// import { usePathname, useRouter } from "next/navigation";

// const SUPPORTED = ["en", "jpn"] as const;
// type Locale = (typeof SUPPORTED)[number];

// function swapLocaleInPath(path: string, newLocale: Locale) {
//   const parts = path.split("/");
//   // parts[0] === "" (because of leading "/")
//   if (SUPPORTED.includes(parts[1] as Locale)) {
//     parts[1] = newLocale;
//   } else {
//     parts.splice(1, 0, newLocale);
//   }
//   return parts.join("/");
// }

// export default function LanguageSwitcher() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const current = (pathname.split("/")[1] as Locale) || "en";
//   const value = SUPPORTED.includes(current) ? current : "en";

//   const changeLanguage = (lang: string) => {
//     const next = swapLocaleInPath(pathname, lang as Locale);
//     router.push(next);
//   };

//   return (
//     <div style={{ position: "absolute", top: 10, right: 10 }}>
//       <select
//         onChange={(e) => changeLanguage(e.target.value)}
//         value={value}
//         style={{ padding: 5, fontSize: 14 }}
//       >
//         <option value="en">English</option>
//         <option value="jpn">日本語 (Japanese)</option>
//       </select>
//     </div>
//   );
// }
