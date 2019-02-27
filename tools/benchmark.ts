import { Suite } from "benchmark";
import data from "./data.json";
import { trimmer } from "../src";

const suite = new Suite();

const trim = trimmer();

// add tests
suite
  .add("RegExp#test", () => {
    trim(data);
  })
  // add listeners
  .on("cycle", (event: any) => {
    console.log(String(event.target));
  })
  .on("complete", function() {
    // @ts-ignore
    console.log("Fastest is " + this.filter("fastest").map("name"));
  })
  // run async
  .run({ async: true });
