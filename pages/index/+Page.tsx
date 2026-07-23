import type { Data } from "./+data";
import PayloPrototype from "../../components/paylo";
import { useData } from "vike-react/useData";

export default function Page() {
  const data = useData<Data>();
  return <PayloPrototype {...data} />;
}
