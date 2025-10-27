"use client";

import { useState } from 'react';
import { FormLogin } from "../../components/formLogin/formLogin";

export default function Login() {

  const [isLogin, setIsLogin] = useState(true);
  

  return (
      <FormLogin />
  );
}