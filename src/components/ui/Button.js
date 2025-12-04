 'use client';
 
 import React from 'react';
 
 const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }) => {
     const baseStyle = "px-6 py-3 rounded-md font-medium transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
     
     const variants = {
         primary: "bg-[#1a1a1a] text-white hover:bg-stone-800 shadow-lg hover:shadow-xl",
         secondary: "bg-white text-[#1a1a1a] border border-stone-200 hover:bg-stone-50 hover:border-[#1a1a1a]",
         outline: "border-2 border-white text-white hover:bg-white hover:text-[#1a1a1a]"
     };
     return (
         <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>{children}</button>
     );
 };
 
 export default Button;