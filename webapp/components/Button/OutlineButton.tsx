import React from "react";

interface ButtonProps {
  children?: React.ReactNode;
  props?: any;
  additionalStyles?: string;
  type?: any;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  link?: string;
  openInNewTab?: boolean;
}

const buttonStyles =
  "relative inline-flex items-center text-white font-clashdisplay border border-white rounded p-2.5 px-6";

const OutlineButton = ({
  children,
  type,
  onClick,
  link,
  openInNewTab,
  additionalStyles,
  ...props
}: ButtonProps) => {
  return type === "link" ? (
    <a
      href={link}
      {...props}
      target={openInNewTab ? "_blank" : ""}
      rel={openInNewTab ? "noopener noreferrer" : ""}
      className={`${buttonStyles} ${additionalStyles} slide-right`}
    >
      {children}
    </a>
  ) : (
    <div className="btn-holder">
      <button
        type={type ? "button" : "submit"}
        {...props}
        onClick={onClick}
        className={`${buttonStyles} ${additionalStyles} slide-right`}
      >
        <span>{children}</span>
      </button>
    </div>
  );
};

export default OutlineButton;
