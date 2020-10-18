import { Subscription } from "rxjs";
import { Store } from "./store";

test("Store with single key counter", (done) => {
  let current = 0;

  const s = new Store({
    counter: current,
  });

  s.get("counter").subscribe((val) => {
    expect(val).toBe(current);
  });

  current += 1;
  s.set("counter", current);

  s.destroy(done);
});

test("Store with throw error if missing key", (done) => {
  let current = 0;

  const s = new Store({
    counter: current,
  });

  expect(() => {
    s.get("missing").subscribe((val) => {});
  }).toThrow("No such key in store");

  s.destroy(done);
});

test("Store will unsubscribe from all subscriptions when destroyed", (done) => {
    let current = 0;
    let name = "Marcus"

    const s = new Store({
      counter: current,
      name: name
    });

    let sub1 = s.get("counter").subscribe((val) => {
        expect(val).toBe(current);
    });

    let sub2 = s.get("name").subscribe((val) => {
        expect(val).toBe(name);
    });

    expect(sub1).toBeInstanceOf(Subscription)
    expect(sub2).toBeInstanceOf(Subscription)
    expect(sub1.closed).toBe(false)
    expect(sub2.closed).toBe(false)
    
    s.destroy(() => {
        expect(sub1.closed).toBe(true)
        expect(sub2.closed).toBe(true)
        done()
    });
})

test("Store will stream store state from all sources", (done) => {
    let current = 0;
    let name = "Marcus"

    const s = new Store({
      counter: current,
      name: name
    });

    let sub = s.state$.subscribe(x => {
        expect(x).toEqual({
            counter: current,
            name: name
        })
    });

    name = "Sam";
    s.set("name", name)

    s.destroy(done)
})