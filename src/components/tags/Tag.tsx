export const Tag = ({ role, text }: { role: string; text: string | null }) => {
  return (
    <div>
      {role === "superAdmin" ? (
        <p className="inline-block text-sm text-violet-500 cursor-default whitespace-nowrap">{text}</p>
      ) : role === "Admin" ? (
        <p className="inline-block text-sm text-pink-500 cursor-default whitespace-nowrap">
          {text}
        </p>
      ) : (
        <p className="inline-block text-sm text-azul-500 cursor-default whitespace-nowrap">{text}</p>
      )}
    </div>
  );
};
