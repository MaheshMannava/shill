interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1E3A8A] via-[#1E40AF] to-[#F97316]">
      <div className="relative w-48 h-48 animate-pulse">
        <img
          src="/images/tempo-image-20250211T150855775Z.png"
          alt="Dr. Shill Logo"
          className="w-full h-full object-contain"
        />
      </div>
      <p className="text-white mt-4 text-xl font-bold">{message}</p>
    </div>
  );
}
