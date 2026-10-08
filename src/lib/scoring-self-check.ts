import bank from "../data/items-bank.json";
import thetaReference from "../data/theta-reference.json";
import { byDifficulty, mergeBanks, type Item, type ItemBank } from "./items";
import { selfCheck } from "./scoring";

const items: Item[] = byDifficulty(mergeBanks([bank] as unknown as ItemBank[]));
const reference = [...(thetaReference as number[])].sort((a, b) => a - b);

selfCheck(items, reference);