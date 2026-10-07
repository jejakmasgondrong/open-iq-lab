import sf1 from "../data/items-sf1.json";
import sf2 from "../data/items-sf2.json";
import sf3 from "../data/items-sf3.json";
import thetaReference from "../data/theta-reference.json";
import { byDifficulty, mergeBanks, type Item, type ItemBank } from "./items";
import { selfCheck } from "./scoring";

const banks = [sf1, sf2, sf3] as unknown as ItemBank[];
const items: Item[] = byDifficulty(mergeBanks(banks));
const reference = [...(thetaReference as number[])].sort((a, b) => a - b);

selfCheck(items, reference);
