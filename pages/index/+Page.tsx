import { useData } from "vike-react/useData";
import NdalamaPrototype from "../../components/ndalama";
import type { Data } from "./+data";

export default function Page() {
  const data = useData<Data>();
  return <NdalamaPrototype {...data} />;
}
