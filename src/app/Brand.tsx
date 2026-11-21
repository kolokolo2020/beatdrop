import Image from "next/image";
import { PRODUCER } from "@/lib/config";
import photo from "../../public/saeculo.jpg";

export default function Brand({ right }: { right?: React.ReactNode }) {
  return (
    <header className="brand">
      <span className="brand-id">
        <Image src={photo} alt="" width={36} height={36} className="avatar" priority />
        <span className="brand-name">{PRODUCER}</span>
      </span>
      {right}
    </header>
  );
}
