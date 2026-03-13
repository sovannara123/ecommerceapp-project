"use client";

import { InputHTMLAttributes, useState } from "react";
import { Input } from "@/shared/ui/forms/Input";
import { Button } from "@/shared/ui/forms/Button";

export function PasswordInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className="pr-24" />
      <Button
        type="button"
        variant="ghost"
        className="absolute right-1 top-1 h-9 px-3"
        onClick={() => setVisible((prev) => !prev)}
      >
        {visible ? "Hide" : "Show"}
      </Button>
    </div>
  );
}
