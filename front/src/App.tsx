import { useState } from "react";
import { TypingTest } from "./features/TypingTest";
import { Settings } from "./types/settings";
import { SettingsModal } from "./features/SettingsModal";
import { useTestQuery } from "./shared/hooks/queries/useTestQuery";
import { useLocalStorage } from "./shared/hooks/useLocalStorage";

const DEFAULT_TYPE = "typescript";
const testData = {
  type: "typescript",
  text: 'import path from "path";\nimport { setupPlaywright } from "./test-utils";\nimport type { TransitionProps } from "../src";\n\ndeclare const React: typeof global.React;\n\ndescribe("Transition", () => {\n  const { page, timeout, nextFrame, html, classList, isVisible, makeRender } =\n    setupPlaywright();\n  const baseUrl = `file://${path.resolve(__dirname, "transition.html")}`;\n\n  const duration = 50;\n  const buffer = 5;\n\n  const transitionFinish = (time = duration) => timeout(time + buffer);\n\n  const render = makeRender(\n    props => {\n      const Transition: React.FC<TransitionProps> = (window as any).Retransition\n        .Transition;\n      return (\n        <div id="container">\n          <Transition {...props}>\n            {({ ref }) => <div ref={ref} id="transition-element"></div>}\n          </Transition>\n        </div>\n      );\n    },\n    res =>\n      Promise.resolve().then(() => {\n        const el = document.querySelector("#transition-element");\n        const classes = el && el.className.split(/\\s+/g);\n        res(classes);\n      })\n  );\n\n  beforeEach(async () => {\n    await page().goto(baseUrl);\n    await page().waitForSelector("#app", { state: "attached" });\n  });\n\n  it("basic transition", async () => {\n    await render({});\n    // enter\n    const enterClasses = await render({ visible: true });\n    expect(enterClasses).toEqual([\n      "transition-enter-from",\n      "transition-enter-active",\n    ]);\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "transition-enter-active",\n      "transition-enter-to",\n    ]);\n    await transitionFinish();\n    expect(await classList("#transition-element")).toEqual([]);\n\n    // leave\n    const leaveClasses = await render({ visible: false });\n    expect(leaveClasses).toEqual([\n      "transition-leave-from",\n      "transition-leave-active",\n    ]);\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "transition-leave-active",\n      "transition-leave-to",\n    ]);\n    await transitionFinish();\n    expect(await html("#container")).toBe("");\n  });\n\n  it("named transition", async () => {\n    await render({});\n    // enter\n    const enterClasses = await render({ visible: true, name: "test" });\n    expect(enterClasses).toEqual(["test-enter-from", "test-enter-active"]);\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "test-enter-active",\n      "test-enter-to",\n    ]);\n    await transitionFinish();\n    expect(await classList("#transition-element")).toEqual([]);\n\n    // leave\n    const leaveClasses = await render({ visible: false });\n    expect(leaveClasses).toEqual(["test-leave-from", "test-leave-active"]);\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "test-leave-active",\n      "test-leave-to",\n    ]);\n    await transitionFinish();\n    expect(await html("#container")).toBe("");\n  });\n\n  it("custom classes", async () => {\n    const classes = {\n      enterFromClass: "enter-step-1",\n      enterActiveClass: "enter-step-2",\n      enterToClass: "enter-step-3",\n      leaveFromClass: "leave-step-1",\n      leaveActiveClass: "leave-step-2",\n      leaveToClass: "leave-step-3",\n    };\n    await render(classes);\n\n    // enter\n    const enterClasses = await render({ visible: true });\n    expect(enterClasses).toEqual([\n      classes.enterFromClass,\n      classes.enterActiveClass,\n    ]);\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      classes.enterActiveClass,\n      classes.enterToClass,\n    ]);\n    await transitionFinish();\n    expect(await classList("#transition-element")).toEqual([]);\n\n    // leave\n    const leaveClasses = await render({ visible: false });\n    expect(leaveClasses).toEqual([\n      classes.leaveFromClass,\n      classes.leaveActiveClass,\n    ]);\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      classes.leaveActiveClass,\n      classes.leaveToClass,\n    ]);\n    await transitionFinish();\n    expect(await html("#container")).toBe("");\n  });\n\n  it("appear", async () => {\n    const appearClasses = await render({\n      name: "test",\n      appear: true,\n      visible: true,\n      appearFromClass: "test-appear-from",\n      appearActiveClass: "test-appear-active",\n      appearToClass: "test-appear-to",\n    });\n\n    // appear\n    expect(appearClasses).toEqual(["test-appear-from", "test-appear-active"]);\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "test-appear-active",\n      "test-appear-to",\n    ]);\n    await transitionFinish();\n    expect(await classList("#transition-element")).toEqual([]);\n\n    // leave\n    const leaveClasses = await render({ visible: false });\n    expect(leaveClasses).toEqual(["test-leave-from", "test-leave-active"]);\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "test-leave-active",\n      "test-leave-to",\n    ]);\n    await transitionFinish();\n    expect(await html("#container")).toBe("");\n\n    // enter;\n    const enterClasses = await render({ visible: true });\n    expect(enterClasses).toEqual(["test-enter-from", "test-enter-active"]);\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "test-enter-active",\n      "test-enter-to",\n    ]);\n    await transitionFinish();\n    expect(await classList("#transition-element")).toEqual([]);\n  });\n\n  it("transition events", async () => {\n    const onBeforeEnter = jest.fn();\n    const onEnter = jest.fn();\n    const onAfterEnter = jest.fn();\n    const onBeforeLeave = jest.fn();\n    const onLeave = jest.fn();\n    const onAfterLeave = jest.fn();\n\n    await render({\n      name: "test",\n      onBeforeEnter,\n      onEnter,\n      onAfterEnter,\n      onBeforeLeave,\n      onLeave,\n      onAfterLeave,\n    });\n\n    // enter\n    const enterClasses = await render({ visible: true });\n    expect(enterClasses).toEqual(["test-enter-from", "test-enter-active"]);\n    expect(onBeforeEnter).toBeCalledTimes(1);\n    expect(onEnter).toBeCalledTimes(1);\n    expect(onAfterEnter).not.toBeCalled();\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "test-enter-active",\n      "test-enter-to",\n    ]);\n    await transitionFinish();\n    expect(onAfterEnter).toBeCalledTimes(1);\n    expect(await classList("#transition-element")).toEqual([]);\n\n    // leave\n    const leaveClasses = await render({ visible: false });\n    expect(onBeforeLeave).toBeCalledTimes(1);\n    expect(onLeave).toBeCalledTimes(1);\n    expect(onAfterLeave).not.toBeCalled();\n    expect(leaveClasses).toEqual(["test-leave-from", "test-leave-active"]);\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "test-leave-active",\n      "test-leave-to",\n    ]);\n    await transitionFinish();\n    expect(onAfterLeave).toBeCalledTimes(1);\n    expect(await html("#container")).toBe("");\n  });\n\n  it("transition events w/ appear", async () => {\n    const onBeforeEnter = jest.fn();\n    const onEnter = jest.fn();\n    const onAfterEnter = jest.fn();\n    const onBeforeLeave = jest.fn();\n    const onLeave = jest.fn();\n    const onAfterLeave = jest.fn();\n    const onBeforeAppear = jest.fn();\n    const onAppear = jest.fn();\n    const onAfterAppear = jest.fn();\n\n    const appearClasses = await render({\n      visible: true,\n      name: "test",\n      appear: true,\n      onBeforeEnter,\n      onEnter,\n      onAfterEnter,\n      onBeforeLeave,\n      onLeave,\n      onAfterLeave,\n      onBeforeAppear,\n      onAppear,\n      onAfterAppear,\n      appearFromClass: "test-appear-from",\n      appearActiveClass: "test-appear-active",\n      appearToClass: "test-appear-to",\n    });\n\n    // appear\n    expect(appearClasses).toEqual(["test-appear-from", "test-appear-active"]);\n    expect(onBeforeAppear).toBeCalledTimes(1);\n    expect(onAppear).toBeCalledTimes(1);\n    expect(onAfterAppear).not.toBeCalled();\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "test-appear-active",\n      "test-appear-to",\n    ]);\n    await transitionFinish();\n    expect(onAfterAppear).toBeCalledTimes(1);\n    expect(await classList("#transition-element")).toEqual([]);\n\n    // leave\n    const leaveClasses = await render({ visible: false });\n    expect(onBeforeLeave).toBeCalledTimes(1);\n    expect(onLeave).toBeCalledTimes(1);\n    expect(onAfterLeave).not.toBeCalled();\n    expect(leaveClasses).toEqual(["test-leave-from", "test-leave-active"]);\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "test-leave-active",\n      "test-leave-to",\n    ]);\n    await transitionFinish();\n    expect(onAfterLeave).toBeCalledTimes(1);\n    expect(await html("#container")).toBe("");\n\n    // enter\n    const enterClasses = await render({ visible: true });\n    expect(enterClasses).toEqual(["test-enter-from", "test-enter-active"]);\n    expect(onBeforeEnter).toBeCalledTimes(1);\n    expect(onEnter).toBeCalledTimes(1);\n    expect(onAfterEnter).not.toBeCalled();\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "test-enter-active",\n      "test-enter-to",\n    ]);\n    await transitionFinish();\n    expect(onAfterEnter).toBeCalledTimes(1);\n    expect(await classList("#transition-element")).toEqual([]);\n  });\n\n  it("transition events w/ appear, calls enter events if no appear events passed", async () => {\n    const onBeforeEnter = jest.fn();\n    const onEnter = jest.fn();\n    const onAfterEnter = jest.fn();\n    const onBeforeLeave = jest.fn();\n    const onLeave = jest.fn();\n    const onAfterLeave = jest.fn();\n\n    const appearClasses = await render({\n      visible: true,\n      name: "test",\n      appear: true,\n      onBeforeEnter,\n      onEnter,\n      onAfterEnter,\n      onBeforeLeave,\n      onLeave,\n      onAfterLeave,\n    });\n\n    // appear\n    expect(appearClasses).toEqual(["test-enter-from", "test-enter-active"]);\n    expect(onBeforeEnter).toBeCalledTimes(1);\n    expect(onEnter).toBeCalledTimes(1);\n    expect(onAfterEnter).not.toBeCalled();\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "test-enter-active",\n      "test-enter-to",\n    ]);\n    await transitionFinish();\n    expect(onAfterEnter).toBeCalledTimes(1);\n    expect(await classList("#transition-element")).toEqual([]);\n\n    // leave\n    const leaveClasses = await render({ visible: false });\n    expect(onBeforeLeave).toBeCalledTimes(1);\n    expect(onLeave).toBeCalledTimes(1);\n    expect(onAfterLeave).not.toBeCalled();\n    expect(leaveClasses).toEqual(["test-leave-from", "test-leave-active"]);\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "test-leave-active",\n      "test-leave-to",\n    ]);\n    await transitionFinish();\n    expect(onAfterLeave).toBeCalledTimes(1);\n    expect(await html("#container")).toBe("");\n\n    // enter\n    const enterClasses = await render({ visible: true });\n    expect(enterClasses).toEqual(["test-enter-from", "test-enter-active"]);\n    expect(onBeforeEnter).toBeCalledTimes(2);\n    expect(onEnter).toBeCalledTimes(2);\n    expect(onAfterEnter).not.toBeCalledTimes(2);\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "test-enter-active",\n      "test-enter-to",\n    ]);\n    await transitionFinish();\n    expect(onAfterEnter).toBeCalledTimes(2);\n    expect(await classList("#transition-element")).toEqual([]);\n  });\n\n  it("customAppear", async () => {\n    const appearClasses = await render({\n      visible: true,\n      name: "test",\n      appear: true,\n      customAppear: true,\n    });\n\n    // appear\n    expect(appearClasses).toEqual(["test-appear-from", "test-appear-active"]);\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "test-appear-active",\n      "test-appear-to",\n    ]);\n    await transitionFinish();\n    expect(await classList("#transition-element")).toEqual([]);\n\n    // leave\n    const leaveClasses = await render({ visible: false });\n    expect(leaveClasses).toEqual(["test-leave-from", "test-leave-active"]);\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "test-leave-active",\n      "test-leave-to",\n    ]);\n    await transitionFinish();\n    expect(await html("#container")).toBe("");\n\n    // enter\n    const enterClasses = await render({ visible: true });\n    expect(enterClasses).toEqual(["test-enter-from", "test-enter-active"]);\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "test-enter-active",\n      "test-enter-to",\n    ]);\n    await transitionFinish();\n    expect(await classList("#transition-element")).toEqual([]);\n  });\n\n  it.skip("customAppear no appear is passed", async () => {});\n\n  it("customAppear w/ transition events", async () => {\n    const onBeforeEnter = jest.fn();\n    const onEnter = jest.fn();\n    const onAfterEnter = jest.fn();\n    const onBeforeLeave = jest.fn();\n    const onLeave = jest.fn();\n    const onAfterLeave = jest.fn();\n    const onBeforeAppear = jest.fn();\n    const onAppear = jest.fn();\n    const onAfterAppear = jest.fn();\n\n    const appearClasses = await render({\n      visible: true,\n      name: "test",\n      appear: true,\n      customAppear: true,\n      onBeforeEnter,\n      onEnter,\n      onAfterEnter,\n      onBeforeLeave,\n      onLeave,\n      onAfterLeave,\n      onBeforeAppear,\n      onAppear,\n      onAfterAppear,\n    });\n\n    // appear\n    expect(appearClasses).toEqual(["test-appear-from", "test-appear-active"]);\n    expect(onBeforeAppear).toBeCalledTimes(1);\n    expect(onAppear).toBeCalledTimes(1);\n    expect(onAfterAppear).not.toBeCalled();\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "test-appear-active",\n      "test-appear-to",\n    ]);\n    await transitionFinish();\n    expect(onAfterAppear).toBeCalledTimes(1);\n    expect(await classList("#transition-element")).toEqual([]);\n\n    // leave\n    const leaveClasses = await render({ visible: false });\n    expect(onBeforeLeave).toBeCalledTimes(1);\n    expect(onLeave).toBeCalledTimes(1);\n    expect(onAfterLeave).not.toBeCalled();\n    expect(leaveClasses).toEqual(["test-leave-from", "test-leave-active"]);\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "test-leave-active",\n      "test-leave-to",\n    ]);\n    await transitionFinish();\n    expect(onAfterLeave).toBeCalledTimes(1);\n    expect(await html("#container")).toBe("");\n\n    // enter\n    const enterClasses = await render({ visible: true });\n    expect(enterClasses).toEqual(["test-enter-from", "test-enter-active"]);\n    expect(onBeforeEnter).toBeCalledTimes(1);\n    expect(onEnter).toBeCalledTimes(1);\n    expect(onAfterEnter).not.toBeCalled();\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "test-enter-active",\n      "test-enter-to",\n    ]);\n    await transitionFinish();\n    expect(onAfterEnter).toBeCalledTimes(1);\n    expect(await classList("#transition-element")).toEqual([]);\n  });\n\n  it("customAppear enter events are not used as default values", async () => {\n    const onBeforeEnter = jest.fn();\n    const onEnter = jest.fn();\n    const onAfterEnter = jest.fn();\n    const onBeforeLeave = jest.fn();\n    const onLeave = jest.fn();\n    const onAfterLeave = jest.fn();\n\n    const appearClasses = await render({\n      visible: true,\n      name: "test",\n      appear: true,\n      customAppear: true,\n      onBeforeEnter,\n      onEnter,\n      onAfterEnter,\n      onBeforeLeave,\n      onLeave,\n      onAfterLeave,\n    });\n\n    // appear\n    expect(appearClasses).toEqual(["test-appear-from", "test-appear-active"]);\n    expect(onBeforeEnter).not.toBeCalled();\n    expect(onEnter).not.toBeCalled();\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "test-appear-active",\n      "test-appear-to",\n    ]);\n    await transitionFinish();\n    expect(onAfterEnter).not.toBeCalledTimes(1);\n    expect(await classList("#transition-element")).toEqual([]);\n\n    // leave\n    const leaveClasses = await render({ visible: false });\n    expect(onBeforeLeave).toBeCalledTimes(1);\n    expect(onLeave).toBeCalledTimes(1);\n    expect(onAfterLeave).not.toBeCalled();\n    expect(leaveClasses).toEqual(["test-leave-from", "test-leave-active"]);\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "test-leave-active",\n      "test-leave-to",\n    ]);\n    await transitionFinish();\n    expect(onAfterLeave).toBeCalledTimes(1);\n    expect(await html("#container")).toBe("");\n\n    // enter\n    const enterClasses = await render({ visible: true });\n    expect(enterClasses).toEqual(["test-enter-from", "test-enter-active"]);\n    expect(onBeforeEnter).toBeCalledTimes(1);\n    expect(onEnter).toBeCalledTimes(1);\n    expect(onAfterEnter).not.toBeCalledTimes(1);\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "test-enter-active",\n      "test-enter-to",\n    ]);\n    await transitionFinish();\n    expect(onAfterEnter).toBeCalledTimes(1);\n    expect(await classList("#transition-element")).toEqual([]);\n  });\n\n  it("no transition detected", async () => {\n    await render({\n      visible: false,\n      name: "noop",\n    });\n    // enter\n    const enterClasses = await render({ visible: true });\n    expect(enterClasses).toEqual(["noop-enter-from", "noop-enter-active"]);\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([]);\n    // leave\n    const leaveClasses = await render({ visible: false });\n    expect(leaveClasses).toEqual(["noop-leave-from", "noop-leave-active"]);\n    await nextFrame();\n    expect(await html("#container")).toEqual("");\n  });\n\n  it("animation", async () => {\n    await render({});\n    // enter\n    const enterClasses = await render({ visible: true, name: "anim" });\n    expect(enterClasses).toEqual(["anim-enter-from", "anim-enter-active"]);\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "anim-enter-active",\n      "anim-enter-to",\n    ]);\n    await transitionFinish();\n    expect(await classList("#transition-element")).toEqual([]);\n\n    // leave\n    const leaveClasses = await render({ visible: false });\n    expect(leaveClasses).toEqual(["anim-leave-from", "anim-leave-active"]);\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "anim-leave-active",\n      "anim-leave-to",\n    ]);\n    await transitionFinish();\n    expect(await html("#container")).toBe("");\n  });\n\n  it("transition with `unmount: false`", async () => {\n    await render({\n      visible: false,\n      name: "test",\n      unmount: false,\n    });\n\n    expect(await isVisible("#transition-element")).toBe(false);\n\n    // enter\n    const enterClasses = await render({ visible: true });\n    expect(enterClasses).toEqual(["test-enter-from", "test-enter-active"]);\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "test-enter-active",\n      "test-enter-to",\n    ]);\n    await transitionFinish();\n    expect(await classList("#transition-element")).toEqual([]);\n\n    // leave\n    const leaveClasses = await render({ visible: false });\n    expect(leaveClasses).toEqual(["test-leave-from", "test-leave-active"]);\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "test-leave-active",\n      "test-leave-to",\n    ]);\n    await transitionFinish();\n    expect(await isVisible("#transition-element")).toBe(false);\n  });\n\n  it("appear w/ `unmount: false`", async () => {\n    const appearClasses = await render({\n      visible: true,\n      name: "test",\n      unmount: false,\n      appear: true,\n      customAppear: true,\n    });\n\n    expect(appearClasses).toEqual(["test-appear-from", "test-appear-active"]);\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "test-appear-active",\n      "test-appear-to",\n    ]);\n    await transitionFinish();\n    expect(await classList("#transition-element")).toEqual([]);\n\n    // leave\n    const leaveClasses = await render({ visible: false });\n    expect(leaveClasses).toEqual(["test-leave-from", "test-leave-active"]);\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "test-leave-active",\n      "test-leave-to",\n    ]);\n    await transitionFinish();\n    expect(await isVisible("#transition-element")).toBe(false);\n\n    // enter\n    const enterClasses = await render({ visible: true });\n    expect(enterClasses).toEqual(["test-enter-from", "test-enter-active"]);\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "test-enter-active",\n      "test-enter-to",\n    ]);\n    await transitionFinish();\n    expect(await classList("#transition-element")).toEqual([]);\n  });\n\n  it.todo("explicit type");\n\n  it("transition cancel (appear/enter/leave)", async () => {\n    const onEnterCancelled = jest.fn();\n    const onAfterEnter = jest.fn();\n    const onLeaveCancelled = jest.fn();\n    const onAfterLeave = jest.fn();\n    const onAppearCancelled = jest.fn();\n    const onAfterAppear = jest.fn();\n\n    const appearClasses = await render({\n      visible: true,\n      name: "test",\n      appear: true,\n      onAfterEnter,\n      onEnterCancelled,\n      onAfterLeave,\n      onLeaveCancelled,\n      onAfterAppear,\n      onAppearCancelled,\n    });\n\n    // appear\n    expect(appearClasses).toEqual(["test-enter-from", "test-enter-active"]);\n    expect(onAppearCancelled).not.toBeCalled();\n    expect(onAfterAppear).not.toBeCalled();\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "test-enter-active",\n      "test-enter-to",\n    ]);\n\n    // leave\n    let leaveClasses = await render({ visible: false });\n    expect(leaveClasses).toEqual(["test-leave-from", "test-leave-active"]);\n    expect(onAppearCancelled).toBeCalled();\n    expect(onAfterAppear).not.toBeCalled();\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "test-leave-active",\n      "test-leave-to",\n    ]);\n\n    // enter\n    const enterClasses = await render({ visible: true });\n    expect(enterClasses).toEqual(["test-enter-from", "test-enter-active"]);\n    expect(onLeaveCancelled).toBeCalled();\n    expect(onAfterLeave).not.toBeCalled();\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "test-enter-active",\n      "test-enter-to",\n    ]);\n\n    leaveClasses = await render({ visible: false });\n    expect(leaveClasses).toEqual(["test-leave-from", "test-leave-active"]);\n    expect(onAfterEnter).not.toBeCalled();\n    expect(onEnterCancelled).toBeCalled();\n\n    await nextFrame();\n    expect(await classList("#transition-element")).toEqual([\n      "test-leave-active",\n      "test-leave-to",\n    ]);\n    await transitionFinish();\n    expect(await html("#container")).toBe("");\n  });\n\n  it("warn if wrong children", async () => {\n    const consoleErrorSpy = jest.spyOn(console, "error");\n\n    await page().evaluate(() => {\n      return new Promise(res => {\n        const { React, ReactDOM, Retransition } = window as any;\n        const { Transition } = Retransition;\n        const baseElement = document.querySelector("#app")!;\n\n        ReactDOM.render(\n          <Transition visible={true}></Transition>,\n          baseElement,\n          res\n        );\n      });\n    });\n\n    expect(consoleErrorSpy).toBeCalled();\n  });\n\n  it.each(["object", "function"])("should work with %s refs", async refType => {\n    // ref mount\n    let passed = await page().evaluate(\n      ({ refType }) => {\n        return new Promise(res => {\n          const { React, ReactDOM, Retransition } = window as any;\n          const Transition: React.FC<TransitionProps> = Retransition.Transition;\n          const baseElement = document.querySelector("#app")!;\n          let ref: any;\n          const Component = () => {\n            ref =\n              refType === "object"\n                ? React.useRef(null)\n                : (el: any) => (ref = { current: el });\n            React.useEffect(() => {\n              if (ref.current instanceof HTMLElement) {\n                return res(true);\n              }\n              res(false);\n            }, []);\n            return (\n              <Transition visible={true} nodeRef={ref}>\n                {({ ref }) => <div ref={ref}>Hello world</div>}\n              </Transition>\n            );\n          };\n          ReactDOM.render(<Component />, baseElement);\n        });\n      },\n      { refType }\n    );\n    expect(passed).toBe(true);\n    // ref unmount\n    passed = await page().evaluate(\n      ({ refType }) => {\n        return new Promise(res => {\n          const { React, ReactDOM, Retransition } = window as any;\n          const Transition: React.FC<TransitionProps> = Retransition.Transition;\n          const baseElement = document.querySelector("#app")!;\n          let ref: any;\n          const Component = ({ visible = true }) => {\n            ref =\n              refType === "object"\n                ? React.useRef(null)\n                : (el: any) => (ref = { current: el });\n            return visible ? (\n              <Transition visible={true} nodeRef={ref}>\n                {({ ref }) => <div ref={ref}>Hello world</div>}\n              </Transition>\n            ) : null;\n          };\n          ReactDOM.render(<Component />, baseElement, () => {\n            if (!(ref.current instanceof HTMLElement)) {\n              throw new Error("didn\'t assigned ref");\n            }\n            ReactDOM.render(<Component visible={false} />, baseElement, () => {\n              // the ref was cleanedup\n              if (ref.current === null) {\n                return res(true);\n              }\n              res(false);\n            });\n          });\n        });\n      },\n      { refType }\n    );\n    expect(passed).toBe(true);\n  });\n\n  it.skip("should not show error about unmounted component state modification", async () => {\n    const consoleErrorSpy = jest.spyOn(console, "error");\n\n    await page().evaluate(() => {\n      return new Promise(res => {\n        const { React, ReactDOM, Retransition } = window as any;\n        const Transition: React.FC<TransitionProps> = Retransition.Transition;\n        const baseElement = document.querySelector("#app")!;\n\n        const Component = () => {\n          const [visible, setVisible] = React.useState(true);\n          const [renderNull, setRenderNull] = React.useState(false);\n\n          React.useEffect(() => {\n            // will run leave animation\n            setVisible(false);\n            window.setTimeout(() => {\n              // should trigger leave animation\n              setRenderNull(true);\n              setTimeout(() => {\n                res(undefined);\n              }, 100);\n            }, 25);\n          }, []);\n\n          if (renderNull) {\n            return null;\n          }\n\n          return (\n            <Transition visible={visible} name="test">\n              {({ ref }) => <div ref={ref}>Hello world</div>}\n            </Transition>\n          );\n        };\n\n        ReactDOM.render(<Component />, baseElement);\n      });\n    });\n\n    expect(consoleErrorSpy).not.toBeCalled();\n  });\n\n  it.todo(\n    "`unmount: false, visible: false` shouldn\'t run enter animation on initial render"\n    // async () => {}\n  );\n\n  it.todo("should preserve elements display with unmount - false");\n});',
  words: [
    {
      text: "import",
      type: "Keyword",
      range: [0, 6],
    },
    {
      text: "path",
      type: "Identifier",
      range: [7, 11],
    },
    {
      text: "from",
      type: "Identifier",
      range: [12, 16],
    },
    {
      text: '"path"',
      type: "String",
      range: [17, 23],
    },
    {
      text: "import",
      type: "Keyword",
      range: [25, 31],
    },
    {
      text: "setupPlaywright",
      type: "Identifier",
      range: [34, 49],
    },
    {
      text: "from",
      type: "Identifier",
      range: [52, 56],
    },
    {
      text: '"./test-utils"',
      type: "String",
      range: [57, 71],
    },
    {
      text: "import",
      type: "Keyword",
      range: [73, 79],
    },
    {
      text: "type",
      type: "Identifier",
      range: [80, 84],
    },
    {
      text: "TransitionProps",
      type: "Identifier",
      range: [87, 102],
    },
    {
      text: "from",
      type: "Identifier",
      range: [105, 109],
    },
    {
      text: '"../src"',
      type: "String",
      range: [110, 118],
    },
    {
      text: "declare",
      type: "Identifier",
      range: [121, 128],
    },
    {
      text: "const",
      type: "Keyword",
      range: [129, 134],
    },
    {
      text: "React",
      type: "Identifier",
      range: [135, 140],
    },
    {
      text: "typeof",
      type: "Keyword",
      range: [142, 148],
    },
    {
      text: "global",
      type: "Identifier",
      range: [149, 155],
    },
    {
      text: "React",
      type: "Identifier",
      range: [156, 161],
    },
    {
      text: "describe",
      type: "Identifier",
      range: [164, 172],
    },
    {
      text: '"Transition"',
      type: "String",
      range: [173, 185],
    },
    {
      text: "const",
      type: "Keyword",
      range: [197, 202],
    },
    {
      text: "page",
      type: "Identifier",
      range: [205, 209],
    },
    {
      text: "timeout",
      type: "Identifier",
      range: [211, 218],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [220, 229],
    },
    {
      text: "html",
      type: "Identifier",
      range: [231, 235],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [237, 246],
    },
    {
      text: "isVisible",
      type: "Identifier",
      range: [248, 257],
    },
    {
      text: "makeRender",
      type: "Identifier",
      range: [259, 269],
    },
    {
      text: "setupPlaywright",
      type: "Identifier",
      range: [278, 293],
    },
    {
      text: "const",
      type: "Keyword",
      range: [299, 304],
    },
    {
      text: "baseUrl",
      type: "Identifier",
      range: [305, 312],
    },
    {
      text: "`file://${",
      type: "Template",
      range: [315, 325],
    },
    {
      text: "path",
      type: "Identifier",
      range: [325, 329],
    },
    {
      text: "resolve",
      type: "Identifier",
      range: [330, 337],
    },
    {
      text: "__dirname",
      type: "Identifier",
      range: [338, 347],
    },
    {
      text: '"transition.html"',
      type: "String",
      range: [349, 366],
    },
    {
      text: "}`",
      type: "Template",
      range: [367, 369],
    },
    {
      text: "const",
      type: "Keyword",
      range: [374, 379],
    },
    {
      text: "duration",
      type: "Identifier",
      range: [380, 388],
    },
    {
      text: "50",
      type: "Numeric",
      range: [391, 393],
    },
    {
      text: "const",
      type: "Keyword",
      range: [397, 402],
    },
    {
      text: "buffer",
      type: "Identifier",
      range: [403, 409],
    },
    {
      text: "5",
      type: "Numeric",
      range: [412, 413],
    },
    {
      text: "const",
      type: "Keyword",
      range: [418, 423],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [424, 440],
    },
    {
      text: "time",
      type: "Identifier",
      range: [444, 448],
    },
    {
      text: "duration",
      type: "Identifier",
      range: [451, 459],
    },
    {
      text: "timeout",
      type: "Identifier",
      range: [464, 471],
    },
    {
      text: "time",
      type: "Identifier",
      range: [472, 476],
    },
    {
      text: "buffer",
      type: "Identifier",
      range: [479, 485],
    },
    {
      text: "const",
      type: "Keyword",
      range: [491, 496],
    },
    {
      text: "render",
      type: "Identifier",
      range: [497, 503],
    },
    {
      text: "makeRender",
      type: "Identifier",
      range: [506, 516],
    },
    {
      text: "props",
      type: "Identifier",
      range: [522, 527],
    },
    {
      text: "const",
      type: "Keyword",
      range: [539, 544],
    },
    {
      text: "Transition",
      type: "Identifier",
      range: [545, 555],
    },
    {
      text: "React",
      type: "Identifier",
      range: [557, 562],
    },
    {
      text: "FC",
      type: "Identifier",
      range: [563, 565],
    },
    {
      text: "TransitionProps",
      type: "Identifier",
      range: [566, 581],
    },
    {
      text: "window",
      type: "Identifier",
      range: [586, 592],
    },
    {
      text: "as",
      type: "Identifier",
      range: [593, 595],
    },
    {
      text: "any",
      type: "Identifier",
      range: [596, 599],
    },
    {
      text: "Retransition",
      type: "Identifier",
      range: [601, 613],
    },
    {
      text: "Transition",
      type: "Identifier",
      range: [623, 633],
    },
    {
      text: "return",
      type: "Keyword",
      range: [641, 647],
    },
    {
      text: "div",
      type: "JSXIdentifier",
      range: [659, 662],
    },
    {
      text: "id",
      type: "JSXIdentifier",
      range: [663, 665],
    },
    {
      text: '"container"',
      type: "JSXText",
      range: [666, 677],
    },
    {
      text: "\n          ",
      type: "JSXText",
      range: [678, 689],
    },
    {
      text: "Transition",
      type: "JSXIdentifier",
      range: [690, 700],
    },
    {
      text: "props",
      type: "Identifier",
      range: [705, 710],
    },
    {
      text: "\n            ",
      type: "JSXText",
      range: [712, 725],
    },
    {
      text: "ref",
      type: "Identifier",
      range: [729, 732],
    },
    {
      text: "div",
      type: "JSXIdentifier",
      range: [740, 743],
    },
    {
      text: "ref",
      type: "JSXIdentifier",
      range: [744, 747],
    },
    {
      text: "ref",
      type: "Identifier",
      range: [749, 752],
    },
    {
      text: "id",
      type: "JSXIdentifier",
      range: [754, 756],
    },
    {
      text: '"transition-element"',
      type: "JSXText",
      range: [757, 777],
    },
    {
      text: "div",
      type: "JSXIdentifier",
      range: [780, 783],
    },
    {
      text: "\n          ",
      type: "JSXText",
      range: [785, 796],
    },
    {
      text: "Transition",
      type: "JSXIdentifier",
      range: [798, 808],
    },
    {
      text: "\n        ",
      type: "JSXText",
      range: [809, 818],
    },
    {
      text: "div",
      type: "JSXIdentifier",
      range: [820, 823],
    },
    {
      text: "res",
      type: "Identifier",
      range: [845, 848],
    },
    {
      text: "Promise",
      type: "Identifier",
      range: [858, 865],
    },
    {
      text: "resolve",
      type: "Identifier",
      range: [866, 873],
    },
    {
      text: "then",
      type: "Identifier",
      range: [876, 880],
    },
    {
      text: "const",
      type: "Keyword",
      range: [897, 902],
    },
    {
      text: "el",
      type: "Identifier",
      range: [903, 905],
    },
    {
      text: "document",
      type: "Identifier",
      range: [908, 916],
    },
    {
      text: "querySelector",
      type: "Identifier",
      range: [917, 930],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [931, 952],
    },
    {
      text: "const",
      type: "Keyword",
      range: [963, 968],
    },
    {
      text: "classes",
      type: "Identifier",
      range: [969, 976],
    },
    {
      text: "el",
      type: "Identifier",
      range: [979, 981],
    },
    {
      text: "el",
      type: "Identifier",
      range: [985, 987],
    },
    {
      text: "className",
      type: "Identifier",
      range: [988, 997],
    },
    {
      text: "split",
      type: "Identifier",
      range: [998, 1003],
    },
    {
      text: "/\\s+/g",
      type: "RegularExpression",
      range: [1004, 1010],
    },
    {
      text: "res",
      type: "Identifier",
      range: [1021, 1024],
    },
    {
      text: "classes",
      type: "Identifier",
      range: [1025, 1032],
    },
    {
      text: "beforeEach",
      type: "Identifier",
      range: [1052, 1062],
    },
    {
      text: "async",
      type: "Identifier",
      range: [1063, 1068],
    },
    {
      text: "await",
      type: "Identifier",
      range: [1081, 1086],
    },
    {
      text: "page",
      type: "Identifier",
      range: [1087, 1091],
    },
    {
      text: "goto",
      type: "Identifier",
      range: [1094, 1098],
    },
    {
      text: "baseUrl",
      type: "Identifier",
      range: [1099, 1106],
    },
    {
      text: "await",
      type: "Identifier",
      range: [1113, 1118],
    },
    {
      text: "page",
      type: "Identifier",
      range: [1119, 1123],
    },
    {
      text: "waitForSelector",
      type: "Identifier",
      range: [1126, 1141],
    },
    {
      text: '"#app"',
      type: "String",
      range: [1142, 1148],
    },
    {
      text: "state",
      type: "Identifier",
      range: [1152, 1157],
    },
    {
      text: '"attached"',
      type: "String",
      range: [1159, 1169],
    },
    {
      text: "it",
      type: "Identifier",
      range: [1183, 1185],
    },
    {
      text: '"basic transition"',
      type: "String",
      range: [1186, 1204],
    },
    {
      text: "async",
      type: "Identifier",
      range: [1206, 1211],
    },
    {
      text: "await",
      type: "Identifier",
      range: [1224, 1229],
    },
    {
      text: "render",
      type: "Identifier",
      range: [1230, 1236],
    },
    {
      text: " enter",
      type: "Line",
      range: [1246, 1254],
    },
    {
      text: "const",
      type: "Keyword",
      range: [1259, 1264],
    },
    {
      text: "enterClasses",
      type: "Identifier",
      range: [1265, 1277],
    },
    {
      text: "await",
      type: "Identifier",
      range: [1280, 1285],
    },
    {
      text: "render",
      type: "Identifier",
      range: [1286, 1292],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [1295, 1302],
    },
    {
      text: "true",
      type: "Boolean",
      range: [1304, 1308],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [1317, 1323],
    },
    {
      text: "enterClasses",
      type: "Identifier",
      range: [1324, 1336],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [1338, 1345],
    },
    {
      text: '"transition-enter-from"',
      type: "String",
      range: [1354, 1377],
    },
    {
      text: '"transition-enter-active"',
      type: "String",
      range: [1385, 1410],
    },
    {
      text: "await",
      type: "Identifier",
      range: [1424, 1429],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [1430, 1439],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [1447, 1453],
    },
    {
      text: "await",
      type: "Identifier",
      range: [1454, 1459],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [1460, 1469],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [1470, 1491],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [1494, 1501],
    },
    {
      text: '"transition-enter-active"',
      type: "String",
      range: [1510, 1535],
    },
    {
      text: '"transition-enter-to"',
      type: "String",
      range: [1543, 1564],
    },
    {
      text: "await",
      type: "Identifier",
      range: [1578, 1583],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [1584, 1600],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [1608, 1614],
    },
    {
      text: "await",
      type: "Identifier",
      range: [1615, 1620],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [1621, 1630],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [1631, 1652],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [1655, 1662],
    },
    {
      text: " leave",
      type: "Line",
      range: [1673, 1681],
    },
    {
      text: "const",
      type: "Keyword",
      range: [1686, 1691],
    },
    {
      text: "leaveClasses",
      type: "Identifier",
      range: [1692, 1704],
    },
    {
      text: "await",
      type: "Identifier",
      range: [1707, 1712],
    },
    {
      text: "render",
      type: "Identifier",
      range: [1713, 1719],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [1722, 1729],
    },
    {
      text: "false",
      type: "Boolean",
      range: [1731, 1736],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [1745, 1751],
    },
    {
      text: "leaveClasses",
      type: "Identifier",
      range: [1752, 1764],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [1766, 1773],
    },
    {
      text: '"transition-leave-from"',
      type: "String",
      range: [1782, 1805],
    },
    {
      text: '"transition-leave-active"',
      type: "String",
      range: [1813, 1838],
    },
    {
      text: "await",
      type: "Identifier",
      range: [1852, 1857],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [1858, 1867],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [1875, 1881],
    },
    {
      text: "await",
      type: "Identifier",
      range: [1882, 1887],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [1888, 1897],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [1898, 1919],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [1922, 1929],
    },
    {
      text: '"transition-leave-active"',
      type: "String",
      range: [1938, 1963],
    },
    {
      text: '"transition-leave-to"',
      type: "String",
      range: [1971, 1992],
    },
    {
      text: "await",
      type: "Identifier",
      range: [2006, 2011],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [2012, 2028],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [2036, 2042],
    },
    {
      text: "await",
      type: "Identifier",
      range: [2043, 2048],
    },
    {
      text: "html",
      type: "Identifier",
      range: [2049, 2053],
    },
    {
      text: '"#container"',
      type: "String",
      range: [2054, 2066],
    },
    {
      text: "toBe",
      type: "Identifier",
      range: [2069, 2073],
    },
    {
      text: '""',
      type: "String",
      range: [2074, 2076],
    },
    {
      text: "it",
      type: "Identifier",
      range: [2088, 2090],
    },
    {
      text: '"named transition"',
      type: "String",
      range: [2091, 2109],
    },
    {
      text: "async",
      type: "Identifier",
      range: [2111, 2116],
    },
    {
      text: "await",
      type: "Identifier",
      range: [2129, 2134],
    },
    {
      text: "render",
      type: "Identifier",
      range: [2135, 2141],
    },
    {
      text: " enter",
      type: "Line",
      range: [2151, 2159],
    },
    {
      text: "const",
      type: "Keyword",
      range: [2164, 2169],
    },
    {
      text: "enterClasses",
      type: "Identifier",
      range: [2170, 2182],
    },
    {
      text: "await",
      type: "Identifier",
      range: [2185, 2190],
    },
    {
      text: "render",
      type: "Identifier",
      range: [2191, 2197],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [2200, 2207],
    },
    {
      text: "true",
      type: "Boolean",
      range: [2209, 2213],
    },
    {
      text: "name",
      type: "Identifier",
      range: [2215, 2219],
    },
    {
      text: '"test"',
      type: "String",
      range: [2221, 2227],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [2236, 2242],
    },
    {
      text: "enterClasses",
      type: "Identifier",
      range: [2243, 2255],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [2257, 2264],
    },
    {
      text: '"test-enter-from"',
      type: "String",
      range: [2266, 2283],
    },
    {
      text: '"test-enter-active"',
      type: "String",
      range: [2285, 2304],
    },
    {
      text: "await",
      type: "Identifier",
      range: [2312, 2317],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [2318, 2327],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [2335, 2341],
    },
    {
      text: "await",
      type: "Identifier",
      range: [2342, 2347],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [2348, 2357],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [2358, 2379],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [2382, 2389],
    },
    {
      text: '"test-enter-active"',
      type: "String",
      range: [2398, 2417],
    },
    {
      text: '"test-enter-to"',
      type: "String",
      range: [2425, 2440],
    },
    {
      text: "await",
      type: "Identifier",
      range: [2454, 2459],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [2460, 2476],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [2484, 2490],
    },
    {
      text: "await",
      type: "Identifier",
      range: [2491, 2496],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [2497, 2506],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [2507, 2528],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [2531, 2538],
    },
    {
      text: " leave",
      type: "Line",
      range: [2549, 2557],
    },
    {
      text: "const",
      type: "Keyword",
      range: [2562, 2567],
    },
    {
      text: "leaveClasses",
      type: "Identifier",
      range: [2568, 2580],
    },
    {
      text: "await",
      type: "Identifier",
      range: [2583, 2588],
    },
    {
      text: "render",
      type: "Identifier",
      range: [2589, 2595],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [2598, 2605],
    },
    {
      text: "false",
      type: "Boolean",
      range: [2607, 2612],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [2621, 2627],
    },
    {
      text: "leaveClasses",
      type: "Identifier",
      range: [2628, 2640],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [2642, 2649],
    },
    {
      text: '"test-leave-from"',
      type: "String",
      range: [2651, 2668],
    },
    {
      text: '"test-leave-active"',
      type: "String",
      range: [2670, 2689],
    },
    {
      text: "await",
      type: "Identifier",
      range: [2697, 2702],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [2703, 2712],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [2720, 2726],
    },
    {
      text: "await",
      type: "Identifier",
      range: [2727, 2732],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [2733, 2742],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [2743, 2764],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [2767, 2774],
    },
    {
      text: '"test-leave-active"',
      type: "String",
      range: [2783, 2802],
    },
    {
      text: '"test-leave-to"',
      type: "String",
      range: [2810, 2825],
    },
    {
      text: "await",
      type: "Identifier",
      range: [2839, 2844],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [2845, 2861],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [2869, 2875],
    },
    {
      text: "await",
      type: "Identifier",
      range: [2876, 2881],
    },
    {
      text: "html",
      type: "Identifier",
      range: [2882, 2886],
    },
    {
      text: '"#container"',
      type: "String",
      range: [2887, 2899],
    },
    {
      text: "toBe",
      type: "Identifier",
      range: [2902, 2906],
    },
    {
      text: '""',
      type: "String",
      range: [2907, 2909],
    },
    {
      text: "it",
      type: "Identifier",
      range: [2921, 2923],
    },
    {
      text: '"custom classes"',
      type: "String",
      range: [2924, 2940],
    },
    {
      text: "async",
      type: "Identifier",
      range: [2942, 2947],
    },
    {
      text: "const",
      type: "Keyword",
      range: [2960, 2965],
    },
    {
      text: "classes",
      type: "Identifier",
      range: [2966, 2973],
    },
    {
      text: "enterFromClass",
      type: "Identifier",
      range: [2984, 2998],
    },
    {
      text: '"enter-step-1"',
      type: "String",
      range: [3000, 3014],
    },
    {
      text: "enterActiveClass",
      type: "Identifier",
      range: [3022, 3038],
    },
    {
      text: '"enter-step-2"',
      type: "String",
      range: [3040, 3054],
    },
    {
      text: "enterToClass",
      type: "Identifier",
      range: [3062, 3074],
    },
    {
      text: '"enter-step-3"',
      type: "String",
      range: [3076, 3090],
    },
    {
      text: "leaveFromClass",
      type: "Identifier",
      range: [3098, 3112],
    },
    {
      text: '"leave-step-1"',
      type: "String",
      range: [3114, 3128],
    },
    {
      text: "leaveActiveClass",
      type: "Identifier",
      range: [3136, 3152],
    },
    {
      text: '"leave-step-2"',
      type: "String",
      range: [3154, 3168],
    },
    {
      text: "leaveToClass",
      type: "Identifier",
      range: [3176, 3188],
    },
    {
      text: '"leave-step-3"',
      type: "String",
      range: [3190, 3204],
    },
    {
      text: "await",
      type: "Identifier",
      range: [3217, 3222],
    },
    {
      text: "render",
      type: "Identifier",
      range: [3223, 3229],
    },
    {
      text: "classes",
      type: "Identifier",
      range: [3230, 3237],
    },
    {
      text: " enter",
      type: "Line",
      range: [3245, 3253],
    },
    {
      text: "const",
      type: "Keyword",
      range: [3258, 3263],
    },
    {
      text: "enterClasses",
      type: "Identifier",
      range: [3264, 3276],
    },
    {
      text: "await",
      type: "Identifier",
      range: [3279, 3284],
    },
    {
      text: "render",
      type: "Identifier",
      range: [3285, 3291],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [3294, 3301],
    },
    {
      text: "true",
      type: "Boolean",
      range: [3303, 3307],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [3316, 3322],
    },
    {
      text: "enterClasses",
      type: "Identifier",
      range: [3323, 3335],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [3337, 3344],
    },
    {
      text: "classes",
      type: "Identifier",
      range: [3353, 3360],
    },
    {
      text: "enterFromClass",
      type: "Identifier",
      range: [3361, 3375],
    },
    {
      text: "classes",
      type: "Identifier",
      range: [3383, 3390],
    },
    {
      text: "enterActiveClass",
      type: "Identifier",
      range: [3391, 3407],
    },
    {
      text: "await",
      type: "Identifier",
      range: [3421, 3426],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [3427, 3436],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [3444, 3450],
    },
    {
      text: "await",
      type: "Identifier",
      range: [3451, 3456],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [3457, 3466],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [3467, 3488],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [3491, 3498],
    },
    {
      text: "classes",
      type: "Identifier",
      range: [3507, 3514],
    },
    {
      text: "enterActiveClass",
      type: "Identifier",
      range: [3515, 3531],
    },
    {
      text: "classes",
      type: "Identifier",
      range: [3539, 3546],
    },
    {
      text: "enterToClass",
      type: "Identifier",
      range: [3547, 3559],
    },
    {
      text: "await",
      type: "Identifier",
      range: [3573, 3578],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [3579, 3595],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [3603, 3609],
    },
    {
      text: "await",
      type: "Identifier",
      range: [3610, 3615],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [3616, 3625],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [3626, 3647],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [3650, 3657],
    },
    {
      text: " leave",
      type: "Line",
      range: [3668, 3676],
    },
    {
      text: "const",
      type: "Keyword",
      range: [3681, 3686],
    },
    {
      text: "leaveClasses",
      type: "Identifier",
      range: [3687, 3699],
    },
    {
      text: "await",
      type: "Identifier",
      range: [3702, 3707],
    },
    {
      text: "render",
      type: "Identifier",
      range: [3708, 3714],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [3717, 3724],
    },
    {
      text: "false",
      type: "Boolean",
      range: [3726, 3731],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [3740, 3746],
    },
    {
      text: "leaveClasses",
      type: "Identifier",
      range: [3747, 3759],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [3761, 3768],
    },
    {
      text: "classes",
      type: "Identifier",
      range: [3777, 3784],
    },
    {
      text: "leaveFromClass",
      type: "Identifier",
      range: [3785, 3799],
    },
    {
      text: "classes",
      type: "Identifier",
      range: [3807, 3814],
    },
    {
      text: "leaveActiveClass",
      type: "Identifier",
      range: [3815, 3831],
    },
    {
      text: "await",
      type: "Identifier",
      range: [3845, 3850],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [3851, 3860],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [3868, 3874],
    },
    {
      text: "await",
      type: "Identifier",
      range: [3875, 3880],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [3881, 3890],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [3891, 3912],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [3915, 3922],
    },
    {
      text: "classes",
      type: "Identifier",
      range: [3931, 3938],
    },
    {
      text: "leaveActiveClass",
      type: "Identifier",
      range: [3939, 3955],
    },
    {
      text: "classes",
      type: "Identifier",
      range: [3963, 3970],
    },
    {
      text: "leaveToClass",
      type: "Identifier",
      range: [3971, 3983],
    },
    {
      text: "await",
      type: "Identifier",
      range: [3997, 4002],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [4003, 4019],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [4027, 4033],
    },
    {
      text: "await",
      type: "Identifier",
      range: [4034, 4039],
    },
    {
      text: "html",
      type: "Identifier",
      range: [4040, 4044],
    },
    {
      text: '"#container"',
      type: "String",
      range: [4045, 4057],
    },
    {
      text: "toBe",
      type: "Identifier",
      range: [4060, 4064],
    },
    {
      text: '""',
      type: "String",
      range: [4065, 4067],
    },
    {
      text: "it",
      type: "Identifier",
      range: [4079, 4081],
    },
    {
      text: '"appear"',
      type: "String",
      range: [4082, 4090],
    },
    {
      text: "async",
      type: "Identifier",
      range: [4092, 4097],
    },
    {
      text: "const",
      type: "Keyword",
      range: [4110, 4115],
    },
    {
      text: "appearClasses",
      type: "Identifier",
      range: [4116, 4129],
    },
    {
      text: "await",
      type: "Identifier",
      range: [4132, 4137],
    },
    {
      text: "render",
      type: "Identifier",
      range: [4138, 4144],
    },
    {
      text: "name",
      type: "Identifier",
      range: [4153, 4157],
    },
    {
      text: '"test"',
      type: "String",
      range: [4159, 4165],
    },
    {
      text: "appear",
      type: "Identifier",
      range: [4173, 4179],
    },
    {
      text: "true",
      type: "Boolean",
      range: [4181, 4185],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [4193, 4200],
    },
    {
      text: "true",
      type: "Boolean",
      range: [4202, 4206],
    },
    {
      text: "appearFromClass",
      type: "Identifier",
      range: [4214, 4229],
    },
    {
      text: '"test-appear-from"',
      type: "String",
      range: [4231, 4249],
    },
    {
      text: "appearActiveClass",
      type: "Identifier",
      range: [4257, 4274],
    },
    {
      text: '"test-appear-active"',
      type: "String",
      range: [4276, 4296],
    },
    {
      text: "appearToClass",
      type: "Identifier",
      range: [4304, 4317],
    },
    {
      text: '"test-appear-to"',
      type: "String",
      range: [4319, 4335],
    },
    {
      text: " appear",
      type: "Line",
      range: [4350, 4359],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [4364, 4370],
    },
    {
      text: "appearClasses",
      type: "Identifier",
      range: [4371, 4384],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [4386, 4393],
    },
    {
      text: '"test-appear-from"',
      type: "String",
      range: [4395, 4413],
    },
    {
      text: '"test-appear-active"',
      type: "String",
      range: [4415, 4435],
    },
    {
      text: "await",
      type: "Identifier",
      range: [4443, 4448],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [4449, 4458],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [4466, 4472],
    },
    {
      text: "await",
      type: "Identifier",
      range: [4473, 4478],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [4479, 4488],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [4489, 4510],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [4513, 4520],
    },
    {
      text: '"test-appear-active"',
      type: "String",
      range: [4529, 4549],
    },
    {
      text: '"test-appear-to"',
      type: "String",
      range: [4557, 4573],
    },
    {
      text: "await",
      type: "Identifier",
      range: [4587, 4592],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [4593, 4609],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [4617, 4623],
    },
    {
      text: "await",
      type: "Identifier",
      range: [4624, 4629],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [4630, 4639],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [4640, 4661],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [4664, 4671],
    },
    {
      text: " leave",
      type: "Line",
      range: [4682, 4690],
    },
    {
      text: "const",
      type: "Keyword",
      range: [4695, 4700],
    },
    {
      text: "leaveClasses",
      type: "Identifier",
      range: [4701, 4713],
    },
    {
      text: "await",
      type: "Identifier",
      range: [4716, 4721],
    },
    {
      text: "render",
      type: "Identifier",
      range: [4722, 4728],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [4731, 4738],
    },
    {
      text: "false",
      type: "Boolean",
      range: [4740, 4745],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [4754, 4760],
    },
    {
      text: "leaveClasses",
      type: "Identifier",
      range: [4761, 4773],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [4775, 4782],
    },
    {
      text: '"test-leave-from"',
      type: "String",
      range: [4784, 4801],
    },
    {
      text: '"test-leave-active"',
      type: "String",
      range: [4803, 4822],
    },
    {
      text: "await",
      type: "Identifier",
      range: [4830, 4835],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [4836, 4845],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [4853, 4859],
    },
    {
      text: "await",
      type: "Identifier",
      range: [4860, 4865],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [4866, 4875],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [4876, 4897],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [4900, 4907],
    },
    {
      text: '"test-leave-active"',
      type: "String",
      range: [4916, 4935],
    },
    {
      text: '"test-leave-to"',
      type: "String",
      range: [4943, 4958],
    },
    {
      text: "await",
      type: "Identifier",
      range: [4972, 4977],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [4978, 4994],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [5002, 5008],
    },
    {
      text: "await",
      type: "Identifier",
      range: [5009, 5014],
    },
    {
      text: "html",
      type: "Identifier",
      range: [5015, 5019],
    },
    {
      text: '"#container"',
      type: "String",
      range: [5020, 5032],
    },
    {
      text: "toBe",
      type: "Identifier",
      range: [5035, 5039],
    },
    {
      text: '""',
      type: "String",
      range: [5040, 5042],
    },
    {
      text: " enter;",
      type: "Line",
      range: [5050, 5059],
    },
    {
      text: "const",
      type: "Keyword",
      range: [5064, 5069],
    },
    {
      text: "enterClasses",
      type: "Identifier",
      range: [5070, 5082],
    },
    {
      text: "await",
      type: "Identifier",
      range: [5085, 5090],
    },
    {
      text: "render",
      type: "Identifier",
      range: [5091, 5097],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [5100, 5107],
    },
    {
      text: "true",
      type: "Boolean",
      range: [5109, 5113],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [5122, 5128],
    },
    {
      text: "enterClasses",
      type: "Identifier",
      range: [5129, 5141],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [5143, 5150],
    },
    {
      text: '"test-enter-from"',
      type: "String",
      range: [5152, 5169],
    },
    {
      text: '"test-enter-active"',
      type: "String",
      range: [5171, 5190],
    },
    {
      text: "await",
      type: "Identifier",
      range: [5198, 5203],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [5204, 5213],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [5221, 5227],
    },
    {
      text: "await",
      type: "Identifier",
      range: [5228, 5233],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [5234, 5243],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [5244, 5265],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [5268, 5275],
    },
    {
      text: '"test-enter-active"',
      type: "String",
      range: [5284, 5303],
    },
    {
      text: '"test-enter-to"',
      type: "String",
      range: [5311, 5326],
    },
    {
      text: "await",
      type: "Identifier",
      range: [5340, 5345],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [5346, 5362],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [5370, 5376],
    },
    {
      text: "await",
      type: "Identifier",
      range: [5377, 5382],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [5383, 5392],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [5393, 5414],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [5417, 5424],
    },
    {
      text: "it",
      type: "Identifier",
      range: [5439, 5441],
    },
    {
      text: '"transition events"',
      type: "String",
      range: [5442, 5461],
    },
    {
      text: "async",
      type: "Identifier",
      range: [5463, 5468],
    },
    {
      text: "const",
      type: "Keyword",
      range: [5481, 5486],
    },
    {
      text: "onBeforeEnter",
      type: "Identifier",
      range: [5487, 5500],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [5503, 5507],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [5508, 5510],
    },
    {
      text: "const",
      type: "Keyword",
      range: [5518, 5523],
    },
    {
      text: "onEnter",
      type: "Identifier",
      range: [5524, 5531],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [5534, 5538],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [5539, 5541],
    },
    {
      text: "const",
      type: "Keyword",
      range: [5549, 5554],
    },
    {
      text: "onAfterEnter",
      type: "Identifier",
      range: [5555, 5567],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [5570, 5574],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [5575, 5577],
    },
    {
      text: "const",
      type: "Keyword",
      range: [5585, 5590],
    },
    {
      text: "onBeforeLeave",
      type: "Identifier",
      range: [5591, 5604],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [5607, 5611],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [5612, 5614],
    },
    {
      text: "const",
      type: "Keyword",
      range: [5622, 5627],
    },
    {
      text: "onLeave",
      type: "Identifier",
      range: [5628, 5635],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [5638, 5642],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [5643, 5645],
    },
    {
      text: "const",
      type: "Keyword",
      range: [5653, 5658],
    },
    {
      text: "onAfterLeave",
      type: "Identifier",
      range: [5659, 5671],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [5674, 5678],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [5679, 5681],
    },
    {
      text: "await",
      type: "Identifier",
      range: [5690, 5695],
    },
    {
      text: "render",
      type: "Identifier",
      range: [5696, 5702],
    },
    {
      text: "name",
      type: "Identifier",
      range: [5711, 5715],
    },
    {
      text: '"test"',
      type: "String",
      range: [5717, 5723],
    },
    {
      text: "onBeforeEnter",
      type: "Identifier",
      range: [5731, 5744],
    },
    {
      text: "onEnter",
      type: "Identifier",
      range: [5752, 5759],
    },
    {
      text: "onAfterEnter",
      type: "Identifier",
      range: [5767, 5779],
    },
    {
      text: "onBeforeLeave",
      type: "Identifier",
      range: [5787, 5800],
    },
    {
      text: "onLeave",
      type: "Identifier",
      range: [5808, 5815],
    },
    {
      text: "onAfterLeave",
      type: "Identifier",
      range: [5823, 5835],
    },
    {
      text: " enter",
      type: "Line",
      range: [5850, 5858],
    },
    {
      text: "const",
      type: "Keyword",
      range: [5863, 5868],
    },
    {
      text: "enterClasses",
      type: "Identifier",
      range: [5869, 5881],
    },
    {
      text: "await",
      type: "Identifier",
      range: [5884, 5889],
    },
    {
      text: "render",
      type: "Identifier",
      range: [5890, 5896],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [5899, 5906],
    },
    {
      text: "true",
      type: "Boolean",
      range: [5908, 5912],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [5921, 5927],
    },
    {
      text: "enterClasses",
      type: "Identifier",
      range: [5928, 5940],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [5942, 5949],
    },
    {
      text: '"test-enter-from"',
      type: "String",
      range: [5951, 5968],
    },
    {
      text: '"test-enter-active"',
      type: "String",
      range: [5970, 5989],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [5997, 6003],
    },
    {
      text: "onBeforeEnter",
      type: "Identifier",
      range: [6004, 6017],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [6019, 6034],
    },
    {
      text: "1",
      type: "Numeric",
      range: [6035, 6036],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [6043, 6049],
    },
    {
      text: "onEnter",
      type: "Identifier",
      range: [6050, 6057],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [6059, 6074],
    },
    {
      text: "1",
      type: "Numeric",
      range: [6075, 6076],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [6083, 6089],
    },
    {
      text: "onAfterEnter",
      type: "Identifier",
      range: [6090, 6102],
    },
    {
      text: "not",
      type: "Identifier",
      range: [6104, 6107],
    },
    {
      text: "toBeCalled",
      type: "Identifier",
      range: [6108, 6118],
    },
    {
      text: "await",
      type: "Identifier",
      range: [6126, 6131],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [6132, 6141],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [6149, 6155],
    },
    {
      text: "await",
      type: "Identifier",
      range: [6156, 6161],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [6162, 6171],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [6172, 6193],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [6196, 6203],
    },
    {
      text: '"test-enter-active"',
      type: "String",
      range: [6212, 6231],
    },
    {
      text: '"test-enter-to"',
      type: "String",
      range: [6239, 6254],
    },
    {
      text: "await",
      type: "Identifier",
      range: [6268, 6273],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [6274, 6290],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [6298, 6304],
    },
    {
      text: "onAfterEnter",
      type: "Identifier",
      range: [6305, 6317],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [6319, 6334],
    },
    {
      text: "1",
      type: "Numeric",
      range: [6335, 6336],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [6343, 6349],
    },
    {
      text: "await",
      type: "Identifier",
      range: [6350, 6355],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [6356, 6365],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [6366, 6387],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [6390, 6397],
    },
    {
      text: " leave",
      type: "Line",
      range: [6408, 6416],
    },
    {
      text: "const",
      type: "Keyword",
      range: [6421, 6426],
    },
    {
      text: "leaveClasses",
      type: "Identifier",
      range: [6427, 6439],
    },
    {
      text: "await",
      type: "Identifier",
      range: [6442, 6447],
    },
    {
      text: "render",
      type: "Identifier",
      range: [6448, 6454],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [6457, 6464],
    },
    {
      text: "false",
      type: "Boolean",
      range: [6466, 6471],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [6480, 6486],
    },
    {
      text: "onBeforeLeave",
      type: "Identifier",
      range: [6487, 6500],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [6502, 6517],
    },
    {
      text: "1",
      type: "Numeric",
      range: [6518, 6519],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [6526, 6532],
    },
    {
      text: "onLeave",
      type: "Identifier",
      range: [6533, 6540],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [6542, 6557],
    },
    {
      text: "1",
      type: "Numeric",
      range: [6558, 6559],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [6566, 6572],
    },
    {
      text: "onAfterLeave",
      type: "Identifier",
      range: [6573, 6585],
    },
    {
      text: "not",
      type: "Identifier",
      range: [6587, 6590],
    },
    {
      text: "toBeCalled",
      type: "Identifier",
      range: [6591, 6601],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [6609, 6615],
    },
    {
      text: "leaveClasses",
      type: "Identifier",
      range: [6616, 6628],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [6630, 6637],
    },
    {
      text: '"test-leave-from"',
      type: "String",
      range: [6639, 6656],
    },
    {
      text: '"test-leave-active"',
      type: "String",
      range: [6658, 6677],
    },
    {
      text: "await",
      type: "Identifier",
      range: [6685, 6690],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [6691, 6700],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [6708, 6714],
    },
    {
      text: "await",
      type: "Identifier",
      range: [6715, 6720],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [6721, 6730],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [6731, 6752],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [6755, 6762],
    },
    {
      text: '"test-leave-active"',
      type: "String",
      range: [6771, 6790],
    },
    {
      text: '"test-leave-to"',
      type: "String",
      range: [6798, 6813],
    },
    {
      text: "await",
      type: "Identifier",
      range: [6827, 6832],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [6833, 6849],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [6857, 6863],
    },
    {
      text: "onAfterLeave",
      type: "Identifier",
      range: [6864, 6876],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [6878, 6893],
    },
    {
      text: "1",
      type: "Numeric",
      range: [6894, 6895],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [6902, 6908],
    },
    {
      text: "await",
      type: "Identifier",
      range: [6909, 6914],
    },
    {
      text: "html",
      type: "Identifier",
      range: [6915, 6919],
    },
    {
      text: '"#container"',
      type: "String",
      range: [6920, 6932],
    },
    {
      text: "toBe",
      type: "Identifier",
      range: [6935, 6939],
    },
    {
      text: '""',
      type: "String",
      range: [6940, 6942],
    },
    {
      text: "it",
      type: "Identifier",
      range: [6954, 6956],
    },
    {
      text: '"transition events w/ appear"',
      type: "String",
      range: [6957, 6986],
    },
    {
      text: "async",
      type: "Identifier",
      range: [6988, 6993],
    },
    {
      text: "const",
      type: "Keyword",
      range: [7006, 7011],
    },
    {
      text: "onBeforeEnter",
      type: "Identifier",
      range: [7012, 7025],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [7028, 7032],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [7033, 7035],
    },
    {
      text: "const",
      type: "Keyword",
      range: [7043, 7048],
    },
    {
      text: "onEnter",
      type: "Identifier",
      range: [7049, 7056],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [7059, 7063],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [7064, 7066],
    },
    {
      text: "const",
      type: "Keyword",
      range: [7074, 7079],
    },
    {
      text: "onAfterEnter",
      type: "Identifier",
      range: [7080, 7092],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [7095, 7099],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [7100, 7102],
    },
    {
      text: "const",
      type: "Keyword",
      range: [7110, 7115],
    },
    {
      text: "onBeforeLeave",
      type: "Identifier",
      range: [7116, 7129],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [7132, 7136],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [7137, 7139],
    },
    {
      text: "const",
      type: "Keyword",
      range: [7147, 7152],
    },
    {
      text: "onLeave",
      type: "Identifier",
      range: [7153, 7160],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [7163, 7167],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [7168, 7170],
    },
    {
      text: "const",
      type: "Keyword",
      range: [7178, 7183],
    },
    {
      text: "onAfterLeave",
      type: "Identifier",
      range: [7184, 7196],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [7199, 7203],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [7204, 7206],
    },
    {
      text: "const",
      type: "Keyword",
      range: [7214, 7219],
    },
    {
      text: "onBeforeAppear",
      type: "Identifier",
      range: [7220, 7234],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [7237, 7241],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [7242, 7244],
    },
    {
      text: "const",
      type: "Keyword",
      range: [7252, 7257],
    },
    {
      text: "onAppear",
      type: "Identifier",
      range: [7258, 7266],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [7269, 7273],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [7274, 7276],
    },
    {
      text: "const",
      type: "Keyword",
      range: [7284, 7289],
    },
    {
      text: "onAfterAppear",
      type: "Identifier",
      range: [7290, 7303],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [7306, 7310],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [7311, 7313],
    },
    {
      text: "const",
      type: "Keyword",
      range: [7322, 7327],
    },
    {
      text: "appearClasses",
      type: "Identifier",
      range: [7328, 7341],
    },
    {
      text: "await",
      type: "Identifier",
      range: [7344, 7349],
    },
    {
      text: "render",
      type: "Identifier",
      range: [7350, 7356],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [7365, 7372],
    },
    {
      text: "true",
      type: "Boolean",
      range: [7374, 7378],
    },
    {
      text: "name",
      type: "Identifier",
      range: [7386, 7390],
    },
    {
      text: '"test"',
      type: "String",
      range: [7392, 7398],
    },
    {
      text: "appear",
      type: "Identifier",
      range: [7406, 7412],
    },
    {
      text: "true",
      type: "Boolean",
      range: [7414, 7418],
    },
    {
      text: "onBeforeEnter",
      type: "Identifier",
      range: [7426, 7439],
    },
    {
      text: "onEnter",
      type: "Identifier",
      range: [7447, 7454],
    },
    {
      text: "onAfterEnter",
      type: "Identifier",
      range: [7462, 7474],
    },
    {
      text: "onBeforeLeave",
      type: "Identifier",
      range: [7482, 7495],
    },
    {
      text: "onLeave",
      type: "Identifier",
      range: [7503, 7510],
    },
    {
      text: "onAfterLeave",
      type: "Identifier",
      range: [7518, 7530],
    },
    {
      text: "onBeforeAppear",
      type: "Identifier",
      range: [7538, 7552],
    },
    {
      text: "onAppear",
      type: "Identifier",
      range: [7560, 7568],
    },
    {
      text: "onAfterAppear",
      type: "Identifier",
      range: [7576, 7589],
    },
    {
      text: "appearFromClass",
      type: "Identifier",
      range: [7597, 7612],
    },
    {
      text: '"test-appear-from"',
      type: "String",
      range: [7614, 7632],
    },
    {
      text: "appearActiveClass",
      type: "Identifier",
      range: [7640, 7657],
    },
    {
      text: '"test-appear-active"',
      type: "String",
      range: [7659, 7679],
    },
    {
      text: "appearToClass",
      type: "Identifier",
      range: [7687, 7700],
    },
    {
      text: '"test-appear-to"',
      type: "String",
      range: [7702, 7718],
    },
    {
      text: " appear",
      type: "Line",
      range: [7733, 7742],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [7747, 7753],
    },
    {
      text: "appearClasses",
      type: "Identifier",
      range: [7754, 7767],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [7769, 7776],
    },
    {
      text: '"test-appear-from"',
      type: "String",
      range: [7778, 7796],
    },
    {
      text: '"test-appear-active"',
      type: "String",
      range: [7798, 7818],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [7826, 7832],
    },
    {
      text: "onBeforeAppear",
      type: "Identifier",
      range: [7833, 7847],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [7849, 7864],
    },
    {
      text: "1",
      type: "Numeric",
      range: [7865, 7866],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [7873, 7879],
    },
    {
      text: "onAppear",
      type: "Identifier",
      range: [7880, 7888],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [7890, 7905],
    },
    {
      text: "1",
      type: "Numeric",
      range: [7906, 7907],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [7914, 7920],
    },
    {
      text: "onAfterAppear",
      type: "Identifier",
      range: [7921, 7934],
    },
    {
      text: "not",
      type: "Identifier",
      range: [7936, 7939],
    },
    {
      text: "toBeCalled",
      type: "Identifier",
      range: [7940, 7950],
    },
    {
      text: "await",
      type: "Identifier",
      range: [7958, 7963],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [7964, 7973],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [7981, 7987],
    },
    {
      text: "await",
      type: "Identifier",
      range: [7988, 7993],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [7994, 8003],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [8004, 8025],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [8028, 8035],
    },
    {
      text: '"test-appear-active"',
      type: "String",
      range: [8044, 8064],
    },
    {
      text: '"test-appear-to"',
      type: "String",
      range: [8072, 8088],
    },
    {
      text: "await",
      type: "Identifier",
      range: [8102, 8107],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [8108, 8124],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [8132, 8138],
    },
    {
      text: "onAfterAppear",
      type: "Identifier",
      range: [8139, 8152],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [8154, 8169],
    },
    {
      text: "1",
      type: "Numeric",
      range: [8170, 8171],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [8178, 8184],
    },
    {
      text: "await",
      type: "Identifier",
      range: [8185, 8190],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [8191, 8200],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [8201, 8222],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [8225, 8232],
    },
    {
      text: " leave",
      type: "Line",
      range: [8243, 8251],
    },
    {
      text: "const",
      type: "Keyword",
      range: [8256, 8261],
    },
    {
      text: "leaveClasses",
      type: "Identifier",
      range: [8262, 8274],
    },
    {
      text: "await",
      type: "Identifier",
      range: [8277, 8282],
    },
    {
      text: "render",
      type: "Identifier",
      range: [8283, 8289],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [8292, 8299],
    },
    {
      text: "false",
      type: "Boolean",
      range: [8301, 8306],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [8315, 8321],
    },
    {
      text: "onBeforeLeave",
      type: "Identifier",
      range: [8322, 8335],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [8337, 8352],
    },
    {
      text: "1",
      type: "Numeric",
      range: [8353, 8354],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [8361, 8367],
    },
    {
      text: "onLeave",
      type: "Identifier",
      range: [8368, 8375],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [8377, 8392],
    },
    {
      text: "1",
      type: "Numeric",
      range: [8393, 8394],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [8401, 8407],
    },
    {
      text: "onAfterLeave",
      type: "Identifier",
      range: [8408, 8420],
    },
    {
      text: "not",
      type: "Identifier",
      range: [8422, 8425],
    },
    {
      text: "toBeCalled",
      type: "Identifier",
      range: [8426, 8436],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [8444, 8450],
    },
    {
      text: "leaveClasses",
      type: "Identifier",
      range: [8451, 8463],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [8465, 8472],
    },
    {
      text: '"test-leave-from"',
      type: "String",
      range: [8474, 8491],
    },
    {
      text: '"test-leave-active"',
      type: "String",
      range: [8493, 8512],
    },
    {
      text: "await",
      type: "Identifier",
      range: [8520, 8525],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [8526, 8535],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [8543, 8549],
    },
    {
      text: "await",
      type: "Identifier",
      range: [8550, 8555],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [8556, 8565],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [8566, 8587],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [8590, 8597],
    },
    {
      text: '"test-leave-active"',
      type: "String",
      range: [8606, 8625],
    },
    {
      text: '"test-leave-to"',
      type: "String",
      range: [8633, 8648],
    },
    {
      text: "await",
      type: "Identifier",
      range: [8662, 8667],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [8668, 8684],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [8692, 8698],
    },
    {
      text: "onAfterLeave",
      type: "Identifier",
      range: [8699, 8711],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [8713, 8728],
    },
    {
      text: "1",
      type: "Numeric",
      range: [8729, 8730],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [8737, 8743],
    },
    {
      text: "await",
      type: "Identifier",
      range: [8744, 8749],
    },
    {
      text: "html",
      type: "Identifier",
      range: [8750, 8754],
    },
    {
      text: '"#container"',
      type: "String",
      range: [8755, 8767],
    },
    {
      text: "toBe",
      type: "Identifier",
      range: [8770, 8774],
    },
    {
      text: '""',
      type: "String",
      range: [8775, 8777],
    },
    {
      text: " enter",
      type: "Line",
      range: [8785, 8793],
    },
    {
      text: "const",
      type: "Keyword",
      range: [8798, 8803],
    },
    {
      text: "enterClasses",
      type: "Identifier",
      range: [8804, 8816],
    },
    {
      text: "await",
      type: "Identifier",
      range: [8819, 8824],
    },
    {
      text: "render",
      type: "Identifier",
      range: [8825, 8831],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [8834, 8841],
    },
    {
      text: "true",
      type: "Boolean",
      range: [8843, 8847],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [8856, 8862],
    },
    {
      text: "enterClasses",
      type: "Identifier",
      range: [8863, 8875],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [8877, 8884],
    },
    {
      text: '"test-enter-from"',
      type: "String",
      range: [8886, 8903],
    },
    {
      text: '"test-enter-active"',
      type: "String",
      range: [8905, 8924],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [8932, 8938],
    },
    {
      text: "onBeforeEnter",
      type: "Identifier",
      range: [8939, 8952],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [8954, 8969],
    },
    {
      text: "1",
      type: "Numeric",
      range: [8970, 8971],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [8978, 8984],
    },
    {
      text: "onEnter",
      type: "Identifier",
      range: [8985, 8992],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [8994, 9009],
    },
    {
      text: "1",
      type: "Numeric",
      range: [9010, 9011],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [9018, 9024],
    },
    {
      text: "onAfterEnter",
      type: "Identifier",
      range: [9025, 9037],
    },
    {
      text: "not",
      type: "Identifier",
      range: [9039, 9042],
    },
    {
      text: "toBeCalled",
      type: "Identifier",
      range: [9043, 9053],
    },
    {
      text: "await",
      type: "Identifier",
      range: [9061, 9066],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [9067, 9076],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [9084, 9090],
    },
    {
      text: "await",
      type: "Identifier",
      range: [9091, 9096],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [9097, 9106],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [9107, 9128],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [9131, 9138],
    },
    {
      text: '"test-enter-active"',
      type: "String",
      range: [9147, 9166],
    },
    {
      text: '"test-enter-to"',
      type: "String",
      range: [9174, 9189],
    },
    {
      text: "await",
      type: "Identifier",
      range: [9203, 9208],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [9209, 9225],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [9233, 9239],
    },
    {
      text: "onAfterEnter",
      type: "Identifier",
      range: [9240, 9252],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [9254, 9269],
    },
    {
      text: "1",
      type: "Numeric",
      range: [9270, 9271],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [9278, 9284],
    },
    {
      text: "await",
      type: "Identifier",
      range: [9285, 9290],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [9291, 9300],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [9301, 9322],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [9325, 9332],
    },
    {
      text: "it",
      type: "Identifier",
      range: [9347, 9349],
    },
    {
      text: '"transition events w/ appear, calls enter events if no appear events passed"',
      type: "String",
      range: [9350, 9426],
    },
    {
      text: "async",
      type: "Identifier",
      range: [9428, 9433],
    },
    {
      text: "const",
      type: "Keyword",
      range: [9446, 9451],
    },
    {
      text: "onBeforeEnter",
      type: "Identifier",
      range: [9452, 9465],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [9468, 9472],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [9473, 9475],
    },
    {
      text: "const",
      type: "Keyword",
      range: [9483, 9488],
    },
    {
      text: "onEnter",
      type: "Identifier",
      range: [9489, 9496],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [9499, 9503],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [9504, 9506],
    },
    {
      text: "const",
      type: "Keyword",
      range: [9514, 9519],
    },
    {
      text: "onAfterEnter",
      type: "Identifier",
      range: [9520, 9532],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [9535, 9539],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [9540, 9542],
    },
    {
      text: "const",
      type: "Keyword",
      range: [9550, 9555],
    },
    {
      text: "onBeforeLeave",
      type: "Identifier",
      range: [9556, 9569],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [9572, 9576],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [9577, 9579],
    },
    {
      text: "const",
      type: "Keyword",
      range: [9587, 9592],
    },
    {
      text: "onLeave",
      type: "Identifier",
      range: [9593, 9600],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [9603, 9607],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [9608, 9610],
    },
    {
      text: "const",
      type: "Keyword",
      range: [9618, 9623],
    },
    {
      text: "onAfterLeave",
      type: "Identifier",
      range: [9624, 9636],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [9639, 9643],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [9644, 9646],
    },
    {
      text: "const",
      type: "Keyword",
      range: [9655, 9660],
    },
    {
      text: "appearClasses",
      type: "Identifier",
      range: [9661, 9674],
    },
    {
      text: "await",
      type: "Identifier",
      range: [9677, 9682],
    },
    {
      text: "render",
      type: "Identifier",
      range: [9683, 9689],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [9698, 9705],
    },
    {
      text: "true",
      type: "Boolean",
      range: [9707, 9711],
    },
    {
      text: "name",
      type: "Identifier",
      range: [9719, 9723],
    },
    {
      text: '"test"',
      type: "String",
      range: [9725, 9731],
    },
    {
      text: "appear",
      type: "Identifier",
      range: [9739, 9745],
    },
    {
      text: "true",
      type: "Boolean",
      range: [9747, 9751],
    },
    {
      text: "onBeforeEnter",
      type: "Identifier",
      range: [9759, 9772],
    },
    {
      text: "onEnter",
      type: "Identifier",
      range: [9780, 9787],
    },
    {
      text: "onAfterEnter",
      type: "Identifier",
      range: [9795, 9807],
    },
    {
      text: "onBeforeLeave",
      type: "Identifier",
      range: [9815, 9828],
    },
    {
      text: "onLeave",
      type: "Identifier",
      range: [9836, 9843],
    },
    {
      text: "onAfterLeave",
      type: "Identifier",
      range: [9851, 9863],
    },
    {
      text: " appear",
      type: "Line",
      range: [9878, 9887],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [9892, 9898],
    },
    {
      text: "appearClasses",
      type: "Identifier",
      range: [9899, 9912],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [9914, 9921],
    },
    {
      text: '"test-enter-from"',
      type: "String",
      range: [9923, 9940],
    },
    {
      text: '"test-enter-active"',
      type: "String",
      range: [9942, 9961],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [9969, 9975],
    },
    {
      text: "onBeforeEnter",
      type: "Identifier",
      range: [9976, 9989],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [9991, 10006],
    },
    {
      text: "1",
      type: "Numeric",
      range: [10007, 10008],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [10015, 10021],
    },
    {
      text: "onEnter",
      type: "Identifier",
      range: [10022, 10029],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [10031, 10046],
    },
    {
      text: "1",
      type: "Numeric",
      range: [10047, 10048],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [10055, 10061],
    },
    {
      text: "onAfterEnter",
      type: "Identifier",
      range: [10062, 10074],
    },
    {
      text: "not",
      type: "Identifier",
      range: [10076, 10079],
    },
    {
      text: "toBeCalled",
      type: "Identifier",
      range: [10080, 10090],
    },
    {
      text: "await",
      type: "Identifier",
      range: [10098, 10103],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [10104, 10113],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [10121, 10127],
    },
    {
      text: "await",
      type: "Identifier",
      range: [10128, 10133],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [10134, 10143],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [10144, 10165],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [10168, 10175],
    },
    {
      text: '"test-enter-active"',
      type: "String",
      range: [10184, 10203],
    },
    {
      text: '"test-enter-to"',
      type: "String",
      range: [10211, 10226],
    },
    {
      text: "await",
      type: "Identifier",
      range: [10240, 10245],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [10246, 10262],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [10270, 10276],
    },
    {
      text: "onAfterEnter",
      type: "Identifier",
      range: [10277, 10289],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [10291, 10306],
    },
    {
      text: "1",
      type: "Numeric",
      range: [10307, 10308],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [10315, 10321],
    },
    {
      text: "await",
      type: "Identifier",
      range: [10322, 10327],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [10328, 10337],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [10338, 10359],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [10362, 10369],
    },
    {
      text: " leave",
      type: "Line",
      range: [10380, 10388],
    },
    {
      text: "const",
      type: "Keyword",
      range: [10393, 10398],
    },
    {
      text: "leaveClasses",
      type: "Identifier",
      range: [10399, 10411],
    },
    {
      text: "await",
      type: "Identifier",
      range: [10414, 10419],
    },
    {
      text: "render",
      type: "Identifier",
      range: [10420, 10426],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [10429, 10436],
    },
    {
      text: "false",
      type: "Boolean",
      range: [10438, 10443],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [10452, 10458],
    },
    {
      text: "onBeforeLeave",
      type: "Identifier",
      range: [10459, 10472],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [10474, 10489],
    },
    {
      text: "1",
      type: "Numeric",
      range: [10490, 10491],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [10498, 10504],
    },
    {
      text: "onLeave",
      type: "Identifier",
      range: [10505, 10512],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [10514, 10529],
    },
    {
      text: "1",
      type: "Numeric",
      range: [10530, 10531],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [10538, 10544],
    },
    {
      text: "onAfterLeave",
      type: "Identifier",
      range: [10545, 10557],
    },
    {
      text: "not",
      type: "Identifier",
      range: [10559, 10562],
    },
    {
      text: "toBeCalled",
      type: "Identifier",
      range: [10563, 10573],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [10581, 10587],
    },
    {
      text: "leaveClasses",
      type: "Identifier",
      range: [10588, 10600],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [10602, 10609],
    },
    {
      text: '"test-leave-from"',
      type: "String",
      range: [10611, 10628],
    },
    {
      text: '"test-leave-active"',
      type: "String",
      range: [10630, 10649],
    },
    {
      text: "await",
      type: "Identifier",
      range: [10657, 10662],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [10663, 10672],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [10680, 10686],
    },
    {
      text: "await",
      type: "Identifier",
      range: [10687, 10692],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [10693, 10702],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [10703, 10724],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [10727, 10734],
    },
    {
      text: '"test-leave-active"',
      type: "String",
      range: [10743, 10762],
    },
    {
      text: '"test-leave-to"',
      type: "String",
      range: [10770, 10785],
    },
    {
      text: "await",
      type: "Identifier",
      range: [10799, 10804],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [10805, 10821],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [10829, 10835],
    },
    {
      text: "onAfterLeave",
      type: "Identifier",
      range: [10836, 10848],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [10850, 10865],
    },
    {
      text: "1",
      type: "Numeric",
      range: [10866, 10867],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [10874, 10880],
    },
    {
      text: "await",
      type: "Identifier",
      range: [10881, 10886],
    },
    {
      text: "html",
      type: "Identifier",
      range: [10887, 10891],
    },
    {
      text: '"#container"',
      type: "String",
      range: [10892, 10904],
    },
    {
      text: "toBe",
      type: "Identifier",
      range: [10907, 10911],
    },
    {
      text: '""',
      type: "String",
      range: [10912, 10914],
    },
    {
      text: " enter",
      type: "Line",
      range: [10922, 10930],
    },
    {
      text: "const",
      type: "Keyword",
      range: [10935, 10940],
    },
    {
      text: "enterClasses",
      type: "Identifier",
      range: [10941, 10953],
    },
    {
      text: "await",
      type: "Identifier",
      range: [10956, 10961],
    },
    {
      text: "render",
      type: "Identifier",
      range: [10962, 10968],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [10971, 10978],
    },
    {
      text: "true",
      type: "Boolean",
      range: [10980, 10984],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [10993, 10999],
    },
    {
      text: "enterClasses",
      type: "Identifier",
      range: [11000, 11012],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [11014, 11021],
    },
    {
      text: '"test-enter-from"',
      type: "String",
      range: [11023, 11040],
    },
    {
      text: '"test-enter-active"',
      type: "String",
      range: [11042, 11061],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [11069, 11075],
    },
    {
      text: "onBeforeEnter",
      type: "Identifier",
      range: [11076, 11089],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [11091, 11106],
    },
    {
      text: "2",
      type: "Numeric",
      range: [11107, 11108],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [11115, 11121],
    },
    {
      text: "onEnter",
      type: "Identifier",
      range: [11122, 11129],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [11131, 11146],
    },
    {
      text: "2",
      type: "Numeric",
      range: [11147, 11148],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [11155, 11161],
    },
    {
      text: "onAfterEnter",
      type: "Identifier",
      range: [11162, 11174],
    },
    {
      text: "not",
      type: "Identifier",
      range: [11176, 11179],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [11180, 11195],
    },
    {
      text: "2",
      type: "Numeric",
      range: [11196, 11197],
    },
    {
      text: "await",
      type: "Identifier",
      range: [11204, 11209],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [11210, 11219],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [11227, 11233],
    },
    {
      text: "await",
      type: "Identifier",
      range: [11234, 11239],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [11240, 11249],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [11250, 11271],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [11274, 11281],
    },
    {
      text: '"test-enter-active"',
      type: "String",
      range: [11290, 11309],
    },
    {
      text: '"test-enter-to"',
      type: "String",
      range: [11317, 11332],
    },
    {
      text: "await",
      type: "Identifier",
      range: [11346, 11351],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [11352, 11368],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [11376, 11382],
    },
    {
      text: "onAfterEnter",
      type: "Identifier",
      range: [11383, 11395],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [11397, 11412],
    },
    {
      text: "2",
      type: "Numeric",
      range: [11413, 11414],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [11421, 11427],
    },
    {
      text: "await",
      type: "Identifier",
      range: [11428, 11433],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [11434, 11443],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [11444, 11465],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [11468, 11475],
    },
    {
      text: "it",
      type: "Identifier",
      range: [11490, 11492],
    },
    {
      text: '"customAppear"',
      type: "String",
      range: [11493, 11507],
    },
    {
      text: "async",
      type: "Identifier",
      range: [11509, 11514],
    },
    {
      text: "const",
      type: "Keyword",
      range: [11527, 11532],
    },
    {
      text: "appearClasses",
      type: "Identifier",
      range: [11533, 11546],
    },
    {
      text: "await",
      type: "Identifier",
      range: [11549, 11554],
    },
    {
      text: "render",
      type: "Identifier",
      range: [11555, 11561],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [11570, 11577],
    },
    {
      text: "true",
      type: "Boolean",
      range: [11579, 11583],
    },
    {
      text: "name",
      type: "Identifier",
      range: [11591, 11595],
    },
    {
      text: '"test"',
      type: "String",
      range: [11597, 11603],
    },
    {
      text: "appear",
      type: "Identifier",
      range: [11611, 11617],
    },
    {
      text: "true",
      type: "Boolean",
      range: [11619, 11623],
    },
    {
      text: "customAppear",
      type: "Identifier",
      range: [11631, 11643],
    },
    {
      text: "true",
      type: "Boolean",
      range: [11645, 11649],
    },
    {
      text: " appear",
      type: "Line",
      range: [11664, 11673],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [11678, 11684],
    },
    {
      text: "appearClasses",
      type: "Identifier",
      range: [11685, 11698],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [11700, 11707],
    },
    {
      text: '"test-appear-from"',
      type: "String",
      range: [11709, 11727],
    },
    {
      text: '"test-appear-active"',
      type: "String",
      range: [11729, 11749],
    },
    {
      text: "await",
      type: "Identifier",
      range: [11757, 11762],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [11763, 11772],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [11780, 11786],
    },
    {
      text: "await",
      type: "Identifier",
      range: [11787, 11792],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [11793, 11802],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [11803, 11824],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [11827, 11834],
    },
    {
      text: '"test-appear-active"',
      type: "String",
      range: [11843, 11863],
    },
    {
      text: '"test-appear-to"',
      type: "String",
      range: [11871, 11887],
    },
    {
      text: "await",
      type: "Identifier",
      range: [11901, 11906],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [11907, 11923],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [11931, 11937],
    },
    {
      text: "await",
      type: "Identifier",
      range: [11938, 11943],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [11944, 11953],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [11954, 11975],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [11978, 11985],
    },
    {
      text: " leave",
      type: "Line",
      range: [11996, 12004],
    },
    {
      text: "const",
      type: "Keyword",
      range: [12009, 12014],
    },
    {
      text: "leaveClasses",
      type: "Identifier",
      range: [12015, 12027],
    },
    {
      text: "await",
      type: "Identifier",
      range: [12030, 12035],
    },
    {
      text: "render",
      type: "Identifier",
      range: [12036, 12042],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [12045, 12052],
    },
    {
      text: "false",
      type: "Boolean",
      range: [12054, 12059],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [12068, 12074],
    },
    {
      text: "leaveClasses",
      type: "Identifier",
      range: [12075, 12087],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [12089, 12096],
    },
    {
      text: '"test-leave-from"',
      type: "String",
      range: [12098, 12115],
    },
    {
      text: '"test-leave-active"',
      type: "String",
      range: [12117, 12136],
    },
    {
      text: "await",
      type: "Identifier",
      range: [12144, 12149],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [12150, 12159],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [12167, 12173],
    },
    {
      text: "await",
      type: "Identifier",
      range: [12174, 12179],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [12180, 12189],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [12190, 12211],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [12214, 12221],
    },
    {
      text: '"test-leave-active"',
      type: "String",
      range: [12230, 12249],
    },
    {
      text: '"test-leave-to"',
      type: "String",
      range: [12257, 12272],
    },
    {
      text: "await",
      type: "Identifier",
      range: [12286, 12291],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [12292, 12308],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [12316, 12322],
    },
    {
      text: "await",
      type: "Identifier",
      range: [12323, 12328],
    },
    {
      text: "html",
      type: "Identifier",
      range: [12329, 12333],
    },
    {
      text: '"#container"',
      type: "String",
      range: [12334, 12346],
    },
    {
      text: "toBe",
      type: "Identifier",
      range: [12349, 12353],
    },
    {
      text: '""',
      type: "String",
      range: [12354, 12356],
    },
    {
      text: " enter",
      type: "Line",
      range: [12364, 12372],
    },
    {
      text: "const",
      type: "Keyword",
      range: [12377, 12382],
    },
    {
      text: "enterClasses",
      type: "Identifier",
      range: [12383, 12395],
    },
    {
      text: "await",
      type: "Identifier",
      range: [12398, 12403],
    },
    {
      text: "render",
      type: "Identifier",
      range: [12404, 12410],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [12413, 12420],
    },
    {
      text: "true",
      type: "Boolean",
      range: [12422, 12426],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [12435, 12441],
    },
    {
      text: "enterClasses",
      type: "Identifier",
      range: [12442, 12454],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [12456, 12463],
    },
    {
      text: '"test-enter-from"',
      type: "String",
      range: [12465, 12482],
    },
    {
      text: '"test-enter-active"',
      type: "String",
      range: [12484, 12503],
    },
    {
      text: "await",
      type: "Identifier",
      range: [12511, 12516],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [12517, 12526],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [12534, 12540],
    },
    {
      text: "await",
      type: "Identifier",
      range: [12541, 12546],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [12547, 12556],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [12557, 12578],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [12581, 12588],
    },
    {
      text: '"test-enter-active"',
      type: "String",
      range: [12597, 12616],
    },
    {
      text: '"test-enter-to"',
      type: "String",
      range: [12624, 12639],
    },
    {
      text: "await",
      type: "Identifier",
      range: [12653, 12658],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [12659, 12675],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [12683, 12689],
    },
    {
      text: "await",
      type: "Identifier",
      range: [12690, 12695],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [12696, 12705],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [12706, 12727],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [12730, 12737],
    },
    {
      text: "it",
      type: "Identifier",
      range: [12752, 12754],
    },
    {
      text: "skip",
      type: "Identifier",
      range: [12755, 12759],
    },
    {
      text: '"customAppear no appear is passed"',
      type: "String",
      range: [12760, 12794],
    },
    {
      text: "async",
      type: "Identifier",
      range: [12796, 12801],
    },
    {
      text: "it",
      type: "Identifier",
      range: [12816, 12818],
    },
    {
      text: '"customAppear w/ transition events"',
      type: "String",
      range: [12819, 12854],
    },
    {
      text: "async",
      type: "Identifier",
      range: [12856, 12861],
    },
    {
      text: "const",
      type: "Keyword",
      range: [12874, 12879],
    },
    {
      text: "onBeforeEnter",
      type: "Identifier",
      range: [12880, 12893],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [12896, 12900],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [12901, 12903],
    },
    {
      text: "const",
      type: "Keyword",
      range: [12911, 12916],
    },
    {
      text: "onEnter",
      type: "Identifier",
      range: [12917, 12924],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [12927, 12931],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [12932, 12934],
    },
    {
      text: "const",
      type: "Keyword",
      range: [12942, 12947],
    },
    {
      text: "onAfterEnter",
      type: "Identifier",
      range: [12948, 12960],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [12963, 12967],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [12968, 12970],
    },
    {
      text: "const",
      type: "Keyword",
      range: [12978, 12983],
    },
    {
      text: "onBeforeLeave",
      type: "Identifier",
      range: [12984, 12997],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [13000, 13004],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [13005, 13007],
    },
    {
      text: "const",
      type: "Keyword",
      range: [13015, 13020],
    },
    {
      text: "onLeave",
      type: "Identifier",
      range: [13021, 13028],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [13031, 13035],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [13036, 13038],
    },
    {
      text: "const",
      type: "Keyword",
      range: [13046, 13051],
    },
    {
      text: "onAfterLeave",
      type: "Identifier",
      range: [13052, 13064],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [13067, 13071],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [13072, 13074],
    },
    {
      text: "const",
      type: "Keyword",
      range: [13082, 13087],
    },
    {
      text: "onBeforeAppear",
      type: "Identifier",
      range: [13088, 13102],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [13105, 13109],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [13110, 13112],
    },
    {
      text: "const",
      type: "Keyword",
      range: [13120, 13125],
    },
    {
      text: "onAppear",
      type: "Identifier",
      range: [13126, 13134],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [13137, 13141],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [13142, 13144],
    },
    {
      text: "const",
      type: "Keyword",
      range: [13152, 13157],
    },
    {
      text: "onAfterAppear",
      type: "Identifier",
      range: [13158, 13171],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [13174, 13178],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [13179, 13181],
    },
    {
      text: "const",
      type: "Keyword",
      range: [13190, 13195],
    },
    {
      text: "appearClasses",
      type: "Identifier",
      range: [13196, 13209],
    },
    {
      text: "await",
      type: "Identifier",
      range: [13212, 13217],
    },
    {
      text: "render",
      type: "Identifier",
      range: [13218, 13224],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [13233, 13240],
    },
    {
      text: "true",
      type: "Boolean",
      range: [13242, 13246],
    },
    {
      text: "name",
      type: "Identifier",
      range: [13254, 13258],
    },
    {
      text: '"test"',
      type: "String",
      range: [13260, 13266],
    },
    {
      text: "appear",
      type: "Identifier",
      range: [13274, 13280],
    },
    {
      text: "true",
      type: "Boolean",
      range: [13282, 13286],
    },
    {
      text: "customAppear",
      type: "Identifier",
      range: [13294, 13306],
    },
    {
      text: "true",
      type: "Boolean",
      range: [13308, 13312],
    },
    {
      text: "onBeforeEnter",
      type: "Identifier",
      range: [13320, 13333],
    },
    {
      text: "onEnter",
      type: "Identifier",
      range: [13341, 13348],
    },
    {
      text: "onAfterEnter",
      type: "Identifier",
      range: [13356, 13368],
    },
    {
      text: "onBeforeLeave",
      type: "Identifier",
      range: [13376, 13389],
    },
    {
      text: "onLeave",
      type: "Identifier",
      range: [13397, 13404],
    },
    {
      text: "onAfterLeave",
      type: "Identifier",
      range: [13412, 13424],
    },
    {
      text: "onBeforeAppear",
      type: "Identifier",
      range: [13432, 13446],
    },
    {
      text: "onAppear",
      type: "Identifier",
      range: [13454, 13462],
    },
    {
      text: "onAfterAppear",
      type: "Identifier",
      range: [13470, 13483],
    },
    {
      text: " appear",
      type: "Line",
      range: [13498, 13507],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [13512, 13518],
    },
    {
      text: "appearClasses",
      type: "Identifier",
      range: [13519, 13532],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [13534, 13541],
    },
    {
      text: '"test-appear-from"',
      type: "String",
      range: [13543, 13561],
    },
    {
      text: '"test-appear-active"',
      type: "String",
      range: [13563, 13583],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [13591, 13597],
    },
    {
      text: "onBeforeAppear",
      type: "Identifier",
      range: [13598, 13612],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [13614, 13629],
    },
    {
      text: "1",
      type: "Numeric",
      range: [13630, 13631],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [13638, 13644],
    },
    {
      text: "onAppear",
      type: "Identifier",
      range: [13645, 13653],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [13655, 13670],
    },
    {
      text: "1",
      type: "Numeric",
      range: [13671, 13672],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [13679, 13685],
    },
    {
      text: "onAfterAppear",
      type: "Identifier",
      range: [13686, 13699],
    },
    {
      text: "not",
      type: "Identifier",
      range: [13701, 13704],
    },
    {
      text: "toBeCalled",
      type: "Identifier",
      range: [13705, 13715],
    },
    {
      text: "await",
      type: "Identifier",
      range: [13723, 13728],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [13729, 13738],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [13746, 13752],
    },
    {
      text: "await",
      type: "Identifier",
      range: [13753, 13758],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [13759, 13768],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [13769, 13790],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [13793, 13800],
    },
    {
      text: '"test-appear-active"',
      type: "String",
      range: [13809, 13829],
    },
    {
      text: '"test-appear-to"',
      type: "String",
      range: [13837, 13853],
    },
    {
      text: "await",
      type: "Identifier",
      range: [13867, 13872],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [13873, 13889],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [13897, 13903],
    },
    {
      text: "onAfterAppear",
      type: "Identifier",
      range: [13904, 13917],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [13919, 13934],
    },
    {
      text: "1",
      type: "Numeric",
      range: [13935, 13936],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [13943, 13949],
    },
    {
      text: "await",
      type: "Identifier",
      range: [13950, 13955],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [13956, 13965],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [13966, 13987],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [13990, 13997],
    },
    {
      text: " leave",
      type: "Line",
      range: [14008, 14016],
    },
    {
      text: "const",
      type: "Keyword",
      range: [14021, 14026],
    },
    {
      text: "leaveClasses",
      type: "Identifier",
      range: [14027, 14039],
    },
    {
      text: "await",
      type: "Identifier",
      range: [14042, 14047],
    },
    {
      text: "render",
      type: "Identifier",
      range: [14048, 14054],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [14057, 14064],
    },
    {
      text: "false",
      type: "Boolean",
      range: [14066, 14071],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [14080, 14086],
    },
    {
      text: "onBeforeLeave",
      type: "Identifier",
      range: [14087, 14100],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [14102, 14117],
    },
    {
      text: "1",
      type: "Numeric",
      range: [14118, 14119],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [14126, 14132],
    },
    {
      text: "onLeave",
      type: "Identifier",
      range: [14133, 14140],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [14142, 14157],
    },
    {
      text: "1",
      type: "Numeric",
      range: [14158, 14159],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [14166, 14172],
    },
    {
      text: "onAfterLeave",
      type: "Identifier",
      range: [14173, 14185],
    },
    {
      text: "not",
      type: "Identifier",
      range: [14187, 14190],
    },
    {
      text: "toBeCalled",
      type: "Identifier",
      range: [14191, 14201],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [14209, 14215],
    },
    {
      text: "leaveClasses",
      type: "Identifier",
      range: [14216, 14228],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [14230, 14237],
    },
    {
      text: '"test-leave-from"',
      type: "String",
      range: [14239, 14256],
    },
    {
      text: '"test-leave-active"',
      type: "String",
      range: [14258, 14277],
    },
    {
      text: "await",
      type: "Identifier",
      range: [14285, 14290],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [14291, 14300],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [14308, 14314],
    },
    {
      text: "await",
      type: "Identifier",
      range: [14315, 14320],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [14321, 14330],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [14331, 14352],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [14355, 14362],
    },
    {
      text: '"test-leave-active"',
      type: "String",
      range: [14371, 14390],
    },
    {
      text: '"test-leave-to"',
      type: "String",
      range: [14398, 14413],
    },
    {
      text: "await",
      type: "Identifier",
      range: [14427, 14432],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [14433, 14449],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [14457, 14463],
    },
    {
      text: "onAfterLeave",
      type: "Identifier",
      range: [14464, 14476],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [14478, 14493],
    },
    {
      text: "1",
      type: "Numeric",
      range: [14494, 14495],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [14502, 14508],
    },
    {
      text: "await",
      type: "Identifier",
      range: [14509, 14514],
    },
    {
      text: "html",
      type: "Identifier",
      range: [14515, 14519],
    },
    {
      text: '"#container"',
      type: "String",
      range: [14520, 14532],
    },
    {
      text: "toBe",
      type: "Identifier",
      range: [14535, 14539],
    },
    {
      text: '""',
      type: "String",
      range: [14540, 14542],
    },
    {
      text: " enter",
      type: "Line",
      range: [14550, 14558],
    },
    {
      text: "const",
      type: "Keyword",
      range: [14563, 14568],
    },
    {
      text: "enterClasses",
      type: "Identifier",
      range: [14569, 14581],
    },
    {
      text: "await",
      type: "Identifier",
      range: [14584, 14589],
    },
    {
      text: "render",
      type: "Identifier",
      range: [14590, 14596],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [14599, 14606],
    },
    {
      text: "true",
      type: "Boolean",
      range: [14608, 14612],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [14621, 14627],
    },
    {
      text: "enterClasses",
      type: "Identifier",
      range: [14628, 14640],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [14642, 14649],
    },
    {
      text: '"test-enter-from"',
      type: "String",
      range: [14651, 14668],
    },
    {
      text: '"test-enter-active"',
      type: "String",
      range: [14670, 14689],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [14697, 14703],
    },
    {
      text: "onBeforeEnter",
      type: "Identifier",
      range: [14704, 14717],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [14719, 14734],
    },
    {
      text: "1",
      type: "Numeric",
      range: [14735, 14736],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [14743, 14749],
    },
    {
      text: "onEnter",
      type: "Identifier",
      range: [14750, 14757],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [14759, 14774],
    },
    {
      text: "1",
      type: "Numeric",
      range: [14775, 14776],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [14783, 14789],
    },
    {
      text: "onAfterEnter",
      type: "Identifier",
      range: [14790, 14802],
    },
    {
      text: "not",
      type: "Identifier",
      range: [14804, 14807],
    },
    {
      text: "toBeCalled",
      type: "Identifier",
      range: [14808, 14818],
    },
    {
      text: "await",
      type: "Identifier",
      range: [14826, 14831],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [14832, 14841],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [14849, 14855],
    },
    {
      text: "await",
      type: "Identifier",
      range: [14856, 14861],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [14862, 14871],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [14872, 14893],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [14896, 14903],
    },
    {
      text: '"test-enter-active"',
      type: "String",
      range: [14912, 14931],
    },
    {
      text: '"test-enter-to"',
      type: "String",
      range: [14939, 14954],
    },
    {
      text: "await",
      type: "Identifier",
      range: [14968, 14973],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [14974, 14990],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [14998, 15004],
    },
    {
      text: "onAfterEnter",
      type: "Identifier",
      range: [15005, 15017],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [15019, 15034],
    },
    {
      text: "1",
      type: "Numeric",
      range: [15035, 15036],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [15043, 15049],
    },
    {
      text: "await",
      type: "Identifier",
      range: [15050, 15055],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [15056, 15065],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [15066, 15087],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [15090, 15097],
    },
    {
      text: "it",
      type: "Identifier",
      range: [15112, 15114],
    },
    {
      text: '"customAppear enter events are not used as default values"',
      type: "String",
      range: [15115, 15173],
    },
    {
      text: "async",
      type: "Identifier",
      range: [15175, 15180],
    },
    {
      text: "const",
      type: "Keyword",
      range: [15193, 15198],
    },
    {
      text: "onBeforeEnter",
      type: "Identifier",
      range: [15199, 15212],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [15215, 15219],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [15220, 15222],
    },
    {
      text: "const",
      type: "Keyword",
      range: [15230, 15235],
    },
    {
      text: "onEnter",
      type: "Identifier",
      range: [15236, 15243],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [15246, 15250],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [15251, 15253],
    },
    {
      text: "const",
      type: "Keyword",
      range: [15261, 15266],
    },
    {
      text: "onAfterEnter",
      type: "Identifier",
      range: [15267, 15279],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [15282, 15286],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [15287, 15289],
    },
    {
      text: "const",
      type: "Keyword",
      range: [15297, 15302],
    },
    {
      text: "onBeforeLeave",
      type: "Identifier",
      range: [15303, 15316],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [15319, 15323],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [15324, 15326],
    },
    {
      text: "const",
      type: "Keyword",
      range: [15334, 15339],
    },
    {
      text: "onLeave",
      type: "Identifier",
      range: [15340, 15347],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [15350, 15354],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [15355, 15357],
    },
    {
      text: "const",
      type: "Keyword",
      range: [15365, 15370],
    },
    {
      text: "onAfterLeave",
      type: "Identifier",
      range: [15371, 15383],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [15386, 15390],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [15391, 15393],
    },
    {
      text: "const",
      type: "Keyword",
      range: [15402, 15407],
    },
    {
      text: "appearClasses",
      type: "Identifier",
      range: [15408, 15421],
    },
    {
      text: "await",
      type: "Identifier",
      range: [15424, 15429],
    },
    {
      text: "render",
      type: "Identifier",
      range: [15430, 15436],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [15445, 15452],
    },
    {
      text: "true",
      type: "Boolean",
      range: [15454, 15458],
    },
    {
      text: "name",
      type: "Identifier",
      range: [15466, 15470],
    },
    {
      text: '"test"',
      type: "String",
      range: [15472, 15478],
    },
    {
      text: "appear",
      type: "Identifier",
      range: [15486, 15492],
    },
    {
      text: "true",
      type: "Boolean",
      range: [15494, 15498],
    },
    {
      text: "customAppear",
      type: "Identifier",
      range: [15506, 15518],
    },
    {
      text: "true",
      type: "Boolean",
      range: [15520, 15524],
    },
    {
      text: "onBeforeEnter",
      type: "Identifier",
      range: [15532, 15545],
    },
    {
      text: "onEnter",
      type: "Identifier",
      range: [15553, 15560],
    },
    {
      text: "onAfterEnter",
      type: "Identifier",
      range: [15568, 15580],
    },
    {
      text: "onBeforeLeave",
      type: "Identifier",
      range: [15588, 15601],
    },
    {
      text: "onLeave",
      type: "Identifier",
      range: [15609, 15616],
    },
    {
      text: "onAfterLeave",
      type: "Identifier",
      range: [15624, 15636],
    },
    {
      text: " appear",
      type: "Line",
      range: [15651, 15660],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [15665, 15671],
    },
    {
      text: "appearClasses",
      type: "Identifier",
      range: [15672, 15685],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [15687, 15694],
    },
    {
      text: '"test-appear-from"',
      type: "String",
      range: [15696, 15714],
    },
    {
      text: '"test-appear-active"',
      type: "String",
      range: [15716, 15736],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [15744, 15750],
    },
    {
      text: "onBeforeEnter",
      type: "Identifier",
      range: [15751, 15764],
    },
    {
      text: "not",
      type: "Identifier",
      range: [15766, 15769],
    },
    {
      text: "toBeCalled",
      type: "Identifier",
      range: [15770, 15780],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [15788, 15794],
    },
    {
      text: "onEnter",
      type: "Identifier",
      range: [15795, 15802],
    },
    {
      text: "not",
      type: "Identifier",
      range: [15804, 15807],
    },
    {
      text: "toBeCalled",
      type: "Identifier",
      range: [15808, 15818],
    },
    {
      text: "await",
      type: "Identifier",
      range: [15826, 15831],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [15832, 15841],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [15849, 15855],
    },
    {
      text: "await",
      type: "Identifier",
      range: [15856, 15861],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [15862, 15871],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [15872, 15893],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [15896, 15903],
    },
    {
      text: '"test-appear-active"',
      type: "String",
      range: [15912, 15932],
    },
    {
      text: '"test-appear-to"',
      type: "String",
      range: [15940, 15956],
    },
    {
      text: "await",
      type: "Identifier",
      range: [15970, 15975],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [15976, 15992],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [16000, 16006],
    },
    {
      text: "onAfterEnter",
      type: "Identifier",
      range: [16007, 16019],
    },
    {
      text: "not",
      type: "Identifier",
      range: [16021, 16024],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [16025, 16040],
    },
    {
      text: "1",
      type: "Numeric",
      range: [16041, 16042],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [16049, 16055],
    },
    {
      text: "await",
      type: "Identifier",
      range: [16056, 16061],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [16062, 16071],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [16072, 16093],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [16096, 16103],
    },
    {
      text: " leave",
      type: "Line",
      range: [16114, 16122],
    },
    {
      text: "const",
      type: "Keyword",
      range: [16127, 16132],
    },
    {
      text: "leaveClasses",
      type: "Identifier",
      range: [16133, 16145],
    },
    {
      text: "await",
      type: "Identifier",
      range: [16148, 16153],
    },
    {
      text: "render",
      type: "Identifier",
      range: [16154, 16160],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [16163, 16170],
    },
    {
      text: "false",
      type: "Boolean",
      range: [16172, 16177],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [16186, 16192],
    },
    {
      text: "onBeforeLeave",
      type: "Identifier",
      range: [16193, 16206],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [16208, 16223],
    },
    {
      text: "1",
      type: "Numeric",
      range: [16224, 16225],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [16232, 16238],
    },
    {
      text: "onLeave",
      type: "Identifier",
      range: [16239, 16246],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [16248, 16263],
    },
    {
      text: "1",
      type: "Numeric",
      range: [16264, 16265],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [16272, 16278],
    },
    {
      text: "onAfterLeave",
      type: "Identifier",
      range: [16279, 16291],
    },
    {
      text: "not",
      type: "Identifier",
      range: [16293, 16296],
    },
    {
      text: "toBeCalled",
      type: "Identifier",
      range: [16297, 16307],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [16315, 16321],
    },
    {
      text: "leaveClasses",
      type: "Identifier",
      range: [16322, 16334],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [16336, 16343],
    },
    {
      text: '"test-leave-from"',
      type: "String",
      range: [16345, 16362],
    },
    {
      text: '"test-leave-active"',
      type: "String",
      range: [16364, 16383],
    },
    {
      text: "await",
      type: "Identifier",
      range: [16391, 16396],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [16397, 16406],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [16414, 16420],
    },
    {
      text: "await",
      type: "Identifier",
      range: [16421, 16426],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [16427, 16436],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [16437, 16458],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [16461, 16468],
    },
    {
      text: '"test-leave-active"',
      type: "String",
      range: [16477, 16496],
    },
    {
      text: '"test-leave-to"',
      type: "String",
      range: [16504, 16519],
    },
    {
      text: "await",
      type: "Identifier",
      range: [16533, 16538],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [16539, 16555],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [16563, 16569],
    },
    {
      text: "onAfterLeave",
      type: "Identifier",
      range: [16570, 16582],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [16584, 16599],
    },
    {
      text: "1",
      type: "Numeric",
      range: [16600, 16601],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [16608, 16614],
    },
    {
      text: "await",
      type: "Identifier",
      range: [16615, 16620],
    },
    {
      text: "html",
      type: "Identifier",
      range: [16621, 16625],
    },
    {
      text: '"#container"',
      type: "String",
      range: [16626, 16638],
    },
    {
      text: "toBe",
      type: "Identifier",
      range: [16641, 16645],
    },
    {
      text: '""',
      type: "String",
      range: [16646, 16648],
    },
    {
      text: " enter",
      type: "Line",
      range: [16656, 16664],
    },
    {
      text: "const",
      type: "Keyword",
      range: [16669, 16674],
    },
    {
      text: "enterClasses",
      type: "Identifier",
      range: [16675, 16687],
    },
    {
      text: "await",
      type: "Identifier",
      range: [16690, 16695],
    },
    {
      text: "render",
      type: "Identifier",
      range: [16696, 16702],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [16705, 16712],
    },
    {
      text: "true",
      type: "Boolean",
      range: [16714, 16718],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [16727, 16733],
    },
    {
      text: "enterClasses",
      type: "Identifier",
      range: [16734, 16746],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [16748, 16755],
    },
    {
      text: '"test-enter-from"',
      type: "String",
      range: [16757, 16774],
    },
    {
      text: '"test-enter-active"',
      type: "String",
      range: [16776, 16795],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [16803, 16809],
    },
    {
      text: "onBeforeEnter",
      type: "Identifier",
      range: [16810, 16823],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [16825, 16840],
    },
    {
      text: "1",
      type: "Numeric",
      range: [16841, 16842],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [16849, 16855],
    },
    {
      text: "onEnter",
      type: "Identifier",
      range: [16856, 16863],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [16865, 16880],
    },
    {
      text: "1",
      type: "Numeric",
      range: [16881, 16882],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [16889, 16895],
    },
    {
      text: "onAfterEnter",
      type: "Identifier",
      range: [16896, 16908],
    },
    {
      text: "not",
      type: "Identifier",
      range: [16910, 16913],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [16914, 16929],
    },
    {
      text: "1",
      type: "Numeric",
      range: [16930, 16931],
    },
    {
      text: "await",
      type: "Identifier",
      range: [16938, 16943],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [16944, 16953],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [16961, 16967],
    },
    {
      text: "await",
      type: "Identifier",
      range: [16968, 16973],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [16974, 16983],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [16984, 17005],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [17008, 17015],
    },
    {
      text: '"test-enter-active"',
      type: "String",
      range: [17024, 17043],
    },
    {
      text: '"test-enter-to"',
      type: "String",
      range: [17051, 17066],
    },
    {
      text: "await",
      type: "Identifier",
      range: [17080, 17085],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [17086, 17102],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [17110, 17116],
    },
    {
      text: "onAfterEnter",
      type: "Identifier",
      range: [17117, 17129],
    },
    {
      text: "toBeCalledTimes",
      type: "Identifier",
      range: [17131, 17146],
    },
    {
      text: "1",
      type: "Numeric",
      range: [17147, 17148],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [17155, 17161],
    },
    {
      text: "await",
      type: "Identifier",
      range: [17162, 17167],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [17168, 17177],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [17178, 17199],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [17202, 17209],
    },
    {
      text: "it",
      type: "Identifier",
      range: [17224, 17226],
    },
    {
      text: '"no transition detected"',
      type: "String",
      range: [17227, 17251],
    },
    {
      text: "async",
      type: "Identifier",
      range: [17253, 17258],
    },
    {
      text: "await",
      type: "Identifier",
      range: [17271, 17276],
    },
    {
      text: "render",
      type: "Identifier",
      range: [17277, 17283],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [17292, 17299],
    },
    {
      text: "false",
      type: "Boolean",
      range: [17301, 17306],
    },
    {
      text: "name",
      type: "Identifier",
      range: [17314, 17318],
    },
    {
      text: '"noop"',
      type: "String",
      range: [17320, 17326],
    },
    {
      text: " enter",
      type: "Line",
      range: [17340, 17348],
    },
    {
      text: "const",
      type: "Keyword",
      range: [17353, 17358],
    },
    {
      text: "enterClasses",
      type: "Identifier",
      range: [17359, 17371],
    },
    {
      text: "await",
      type: "Identifier",
      range: [17374, 17379],
    },
    {
      text: "render",
      type: "Identifier",
      range: [17380, 17386],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [17389, 17396],
    },
    {
      text: "true",
      type: "Boolean",
      range: [17398, 17402],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [17411, 17417],
    },
    {
      text: "enterClasses",
      type: "Identifier",
      range: [17418, 17430],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [17432, 17439],
    },
    {
      text: '"noop-enter-from"',
      type: "String",
      range: [17441, 17458],
    },
    {
      text: '"noop-enter-active"',
      type: "String",
      range: [17460, 17479],
    },
    {
      text: "await",
      type: "Identifier",
      range: [17487, 17492],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [17493, 17502],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [17510, 17516],
    },
    {
      text: "await",
      type: "Identifier",
      range: [17517, 17522],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [17523, 17532],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [17533, 17554],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [17557, 17564],
    },
    {
      text: " leave",
      type: "Line",
      range: [17574, 17582],
    },
    {
      text: "const",
      type: "Keyword",
      range: [17587, 17592],
    },
    {
      text: "leaveClasses",
      type: "Identifier",
      range: [17593, 17605],
    },
    {
      text: "await",
      type: "Identifier",
      range: [17608, 17613],
    },
    {
      text: "render",
      type: "Identifier",
      range: [17614, 17620],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [17623, 17630],
    },
    {
      text: "false",
      type: "Boolean",
      range: [17632, 17637],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [17646, 17652],
    },
    {
      text: "leaveClasses",
      type: "Identifier",
      range: [17653, 17665],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [17667, 17674],
    },
    {
      text: '"noop-leave-from"',
      type: "String",
      range: [17676, 17693],
    },
    {
      text: '"noop-leave-active"',
      type: "String",
      range: [17695, 17714],
    },
    {
      text: "await",
      type: "Identifier",
      range: [17722, 17727],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [17728, 17737],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [17745, 17751],
    },
    {
      text: "await",
      type: "Identifier",
      range: [17752, 17757],
    },
    {
      text: "html",
      type: "Identifier",
      range: [17758, 17762],
    },
    {
      text: '"#container"',
      type: "String",
      range: [17763, 17775],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [17778, 17785],
    },
    {
      text: '""',
      type: "String",
      range: [17786, 17788],
    },
    {
      text: "it",
      type: "Identifier",
      range: [17800, 17802],
    },
    {
      text: '"animation"',
      type: "String",
      range: [17803, 17814],
    },
    {
      text: "async",
      type: "Identifier",
      range: [17816, 17821],
    },
    {
      text: "await",
      type: "Identifier",
      range: [17834, 17839],
    },
    {
      text: "render",
      type: "Identifier",
      range: [17840, 17846],
    },
    {
      text: " enter",
      type: "Line",
      range: [17856, 17864],
    },
    {
      text: "const",
      type: "Keyword",
      range: [17869, 17874],
    },
    {
      text: "enterClasses",
      type: "Identifier",
      range: [17875, 17887],
    },
    {
      text: "await",
      type: "Identifier",
      range: [17890, 17895],
    },
    {
      text: "render",
      type: "Identifier",
      range: [17896, 17902],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [17905, 17912],
    },
    {
      text: "true",
      type: "Boolean",
      range: [17914, 17918],
    },
    {
      text: "name",
      type: "Identifier",
      range: [17920, 17924],
    },
    {
      text: '"anim"',
      type: "String",
      range: [17926, 17932],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [17941, 17947],
    },
    {
      text: "enterClasses",
      type: "Identifier",
      range: [17948, 17960],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [17962, 17969],
    },
    {
      text: '"anim-enter-from"',
      type: "String",
      range: [17971, 17988],
    },
    {
      text: '"anim-enter-active"',
      type: "String",
      range: [17990, 18009],
    },
    {
      text: "await",
      type: "Identifier",
      range: [18017, 18022],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [18023, 18032],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [18040, 18046],
    },
    {
      text: "await",
      type: "Identifier",
      range: [18047, 18052],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [18053, 18062],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [18063, 18084],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [18087, 18094],
    },
    {
      text: '"anim-enter-active"',
      type: "String",
      range: [18103, 18122],
    },
    {
      text: '"anim-enter-to"',
      type: "String",
      range: [18130, 18145],
    },
    {
      text: "await",
      type: "Identifier",
      range: [18159, 18164],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [18165, 18181],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [18189, 18195],
    },
    {
      text: "await",
      type: "Identifier",
      range: [18196, 18201],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [18202, 18211],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [18212, 18233],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [18236, 18243],
    },
    {
      text: " leave",
      type: "Line",
      range: [18254, 18262],
    },
    {
      text: "const",
      type: "Keyword",
      range: [18267, 18272],
    },
    {
      text: "leaveClasses",
      type: "Identifier",
      range: [18273, 18285],
    },
    {
      text: "await",
      type: "Identifier",
      range: [18288, 18293],
    },
    {
      text: "render",
      type: "Identifier",
      range: [18294, 18300],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [18303, 18310],
    },
    {
      text: "false",
      type: "Boolean",
      range: [18312, 18317],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [18326, 18332],
    },
    {
      text: "leaveClasses",
      type: "Identifier",
      range: [18333, 18345],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [18347, 18354],
    },
    {
      text: '"anim-leave-from"',
      type: "String",
      range: [18356, 18373],
    },
    {
      text: '"anim-leave-active"',
      type: "String",
      range: [18375, 18394],
    },
    {
      text: "await",
      type: "Identifier",
      range: [18402, 18407],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [18408, 18417],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [18425, 18431],
    },
    {
      text: "await",
      type: "Identifier",
      range: [18432, 18437],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [18438, 18447],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [18448, 18469],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [18472, 18479],
    },
    {
      text: '"anim-leave-active"',
      type: "String",
      range: [18488, 18507],
    },
    {
      text: '"anim-leave-to"',
      type: "String",
      range: [18515, 18530],
    },
    {
      text: "await",
      type: "Identifier",
      range: [18544, 18549],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [18550, 18566],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [18574, 18580],
    },
    {
      text: "await",
      type: "Identifier",
      range: [18581, 18586],
    },
    {
      text: "html",
      type: "Identifier",
      range: [18587, 18591],
    },
    {
      text: '"#container"',
      type: "String",
      range: [18592, 18604],
    },
    {
      text: "toBe",
      type: "Identifier",
      range: [18607, 18611],
    },
    {
      text: '""',
      type: "String",
      range: [18612, 18614],
    },
    {
      text: "it",
      type: "Identifier",
      range: [18626, 18628],
    },
    {
      text: '"transition with `unmount: false`"',
      type: "String",
      range: [18629, 18663],
    },
    {
      text: "async",
      type: "Identifier",
      range: [18665, 18670],
    },
    {
      text: "await",
      type: "Identifier",
      range: [18683, 18688],
    },
    {
      text: "render",
      type: "Identifier",
      range: [18689, 18695],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [18704, 18711],
    },
    {
      text: "false",
      type: "Boolean",
      range: [18713, 18718],
    },
    {
      text: "name",
      type: "Identifier",
      range: [18726, 18730],
    },
    {
      text: '"test"',
      type: "String",
      range: [18732, 18738],
    },
    {
      text: "unmount",
      type: "Identifier",
      range: [18746, 18753],
    },
    {
      text: "false",
      type: "Boolean",
      range: [18755, 18760],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [18775, 18781],
    },
    {
      text: "await",
      type: "Identifier",
      range: [18782, 18787],
    },
    {
      text: "isVisible",
      type: "Identifier",
      range: [18788, 18797],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [18798, 18819],
    },
    {
      text: "toBe",
      type: "Identifier",
      range: [18822, 18826],
    },
    {
      text: "false",
      type: "Boolean",
      range: [18827, 18832],
    },
    {
      text: " enter",
      type: "Line",
      range: [18840, 18848],
    },
    {
      text: "const",
      type: "Keyword",
      range: [18853, 18858],
    },
    {
      text: "enterClasses",
      type: "Identifier",
      range: [18859, 18871],
    },
    {
      text: "await",
      type: "Identifier",
      range: [18874, 18879],
    },
    {
      text: "render",
      type: "Identifier",
      range: [18880, 18886],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [18889, 18896],
    },
    {
      text: "true",
      type: "Boolean",
      range: [18898, 18902],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [18911, 18917],
    },
    {
      text: "enterClasses",
      type: "Identifier",
      range: [18918, 18930],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [18932, 18939],
    },
    {
      text: '"test-enter-from"',
      type: "String",
      range: [18941, 18958],
    },
    {
      text: '"test-enter-active"',
      type: "String",
      range: [18960, 18979],
    },
    {
      text: "await",
      type: "Identifier",
      range: [18987, 18992],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [18993, 19002],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [19010, 19016],
    },
    {
      text: "await",
      type: "Identifier",
      range: [19017, 19022],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [19023, 19032],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [19033, 19054],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [19057, 19064],
    },
    {
      text: '"test-enter-active"',
      type: "String",
      range: [19073, 19092],
    },
    {
      text: '"test-enter-to"',
      type: "String",
      range: [19100, 19115],
    },
    {
      text: "await",
      type: "Identifier",
      range: [19129, 19134],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [19135, 19151],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [19159, 19165],
    },
    {
      text: "await",
      type: "Identifier",
      range: [19166, 19171],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [19172, 19181],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [19182, 19203],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [19206, 19213],
    },
    {
      text: " leave",
      type: "Line",
      range: [19224, 19232],
    },
    {
      text: "const",
      type: "Keyword",
      range: [19237, 19242],
    },
    {
      text: "leaveClasses",
      type: "Identifier",
      range: [19243, 19255],
    },
    {
      text: "await",
      type: "Identifier",
      range: [19258, 19263],
    },
    {
      text: "render",
      type: "Identifier",
      range: [19264, 19270],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [19273, 19280],
    },
    {
      text: "false",
      type: "Boolean",
      range: [19282, 19287],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [19296, 19302],
    },
    {
      text: "leaveClasses",
      type: "Identifier",
      range: [19303, 19315],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [19317, 19324],
    },
    {
      text: '"test-leave-from"',
      type: "String",
      range: [19326, 19343],
    },
    {
      text: '"test-leave-active"',
      type: "String",
      range: [19345, 19364],
    },
    {
      text: "await",
      type: "Identifier",
      range: [19372, 19377],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [19378, 19387],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [19395, 19401],
    },
    {
      text: "await",
      type: "Identifier",
      range: [19402, 19407],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [19408, 19417],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [19418, 19439],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [19442, 19449],
    },
    {
      text: '"test-leave-active"',
      type: "String",
      range: [19458, 19477],
    },
    {
      text: '"test-leave-to"',
      type: "String",
      range: [19485, 19500],
    },
    {
      text: "await",
      type: "Identifier",
      range: [19514, 19519],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [19520, 19536],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [19544, 19550],
    },
    {
      text: "await",
      type: "Identifier",
      range: [19551, 19556],
    },
    {
      text: "isVisible",
      type: "Identifier",
      range: [19557, 19566],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [19567, 19588],
    },
    {
      text: "toBe",
      type: "Identifier",
      range: [19591, 19595],
    },
    {
      text: "false",
      type: "Boolean",
      range: [19596, 19601],
    },
    {
      text: "it",
      type: "Identifier",
      range: [19613, 19615],
    },
    {
      text: '"appear w/ `unmount: false`"',
      type: "String",
      range: [19616, 19644],
    },
    {
      text: "async",
      type: "Identifier",
      range: [19646, 19651],
    },
    {
      text: "const",
      type: "Keyword",
      range: [19664, 19669],
    },
    {
      text: "appearClasses",
      type: "Identifier",
      range: [19670, 19683],
    },
    {
      text: "await",
      type: "Identifier",
      range: [19686, 19691],
    },
    {
      text: "render",
      type: "Identifier",
      range: [19692, 19698],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [19707, 19714],
    },
    {
      text: "true",
      type: "Boolean",
      range: [19716, 19720],
    },
    {
      text: "name",
      type: "Identifier",
      range: [19728, 19732],
    },
    {
      text: '"test"',
      type: "String",
      range: [19734, 19740],
    },
    {
      text: "unmount",
      type: "Identifier",
      range: [19748, 19755],
    },
    {
      text: "false",
      type: "Boolean",
      range: [19757, 19762],
    },
    {
      text: "appear",
      type: "Identifier",
      range: [19770, 19776],
    },
    {
      text: "true",
      type: "Boolean",
      range: [19778, 19782],
    },
    {
      text: "customAppear",
      type: "Identifier",
      range: [19790, 19802],
    },
    {
      text: "true",
      type: "Boolean",
      range: [19804, 19808],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [19823, 19829],
    },
    {
      text: "appearClasses",
      type: "Identifier",
      range: [19830, 19843],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [19845, 19852],
    },
    {
      text: '"test-appear-from"',
      type: "String",
      range: [19854, 19872],
    },
    {
      text: '"test-appear-active"',
      type: "String",
      range: [19874, 19894],
    },
    {
      text: "await",
      type: "Identifier",
      range: [19902, 19907],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [19908, 19917],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [19925, 19931],
    },
    {
      text: "await",
      type: "Identifier",
      range: [19932, 19937],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [19938, 19947],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [19948, 19969],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [19972, 19979],
    },
    {
      text: '"test-appear-active"',
      type: "String",
      range: [19988, 20008],
    },
    {
      text: '"test-appear-to"',
      type: "String",
      range: [20016, 20032],
    },
    {
      text: "await",
      type: "Identifier",
      range: [20046, 20051],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [20052, 20068],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [20076, 20082],
    },
    {
      text: "await",
      type: "Identifier",
      range: [20083, 20088],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [20089, 20098],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [20099, 20120],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [20123, 20130],
    },
    {
      text: " leave",
      type: "Line",
      range: [20141, 20149],
    },
    {
      text: "const",
      type: "Keyword",
      range: [20154, 20159],
    },
    {
      text: "leaveClasses",
      type: "Identifier",
      range: [20160, 20172],
    },
    {
      text: "await",
      type: "Identifier",
      range: [20175, 20180],
    },
    {
      text: "render",
      type: "Identifier",
      range: [20181, 20187],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [20190, 20197],
    },
    {
      text: "false",
      type: "Boolean",
      range: [20199, 20204],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [20213, 20219],
    },
    {
      text: "leaveClasses",
      type: "Identifier",
      range: [20220, 20232],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [20234, 20241],
    },
    {
      text: '"test-leave-from"',
      type: "String",
      range: [20243, 20260],
    },
    {
      text: '"test-leave-active"',
      type: "String",
      range: [20262, 20281],
    },
    {
      text: "await",
      type: "Identifier",
      range: [20289, 20294],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [20295, 20304],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [20312, 20318],
    },
    {
      text: "await",
      type: "Identifier",
      range: [20319, 20324],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [20325, 20334],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [20335, 20356],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [20359, 20366],
    },
    {
      text: '"test-leave-active"',
      type: "String",
      range: [20375, 20394],
    },
    {
      text: '"test-leave-to"',
      type: "String",
      range: [20402, 20417],
    },
    {
      text: "await",
      type: "Identifier",
      range: [20431, 20436],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [20437, 20453],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [20461, 20467],
    },
    {
      text: "await",
      type: "Identifier",
      range: [20468, 20473],
    },
    {
      text: "isVisible",
      type: "Identifier",
      range: [20474, 20483],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [20484, 20505],
    },
    {
      text: "toBe",
      type: "Identifier",
      range: [20508, 20512],
    },
    {
      text: "false",
      type: "Boolean",
      range: [20513, 20518],
    },
    {
      text: " enter",
      type: "Line",
      range: [20526, 20534],
    },
    {
      text: "const",
      type: "Keyword",
      range: [20539, 20544],
    },
    {
      text: "enterClasses",
      type: "Identifier",
      range: [20545, 20557],
    },
    {
      text: "await",
      type: "Identifier",
      range: [20560, 20565],
    },
    {
      text: "render",
      type: "Identifier",
      range: [20566, 20572],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [20575, 20582],
    },
    {
      text: "true",
      type: "Boolean",
      range: [20584, 20588],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [20597, 20603],
    },
    {
      text: "enterClasses",
      type: "Identifier",
      range: [20604, 20616],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [20618, 20625],
    },
    {
      text: '"test-enter-from"',
      type: "String",
      range: [20627, 20644],
    },
    {
      text: '"test-enter-active"',
      type: "String",
      range: [20646, 20665],
    },
    {
      text: "await",
      type: "Identifier",
      range: [20673, 20678],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [20679, 20688],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [20696, 20702],
    },
    {
      text: "await",
      type: "Identifier",
      range: [20703, 20708],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [20709, 20718],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [20719, 20740],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [20743, 20750],
    },
    {
      text: '"test-enter-active"',
      type: "String",
      range: [20759, 20778],
    },
    {
      text: '"test-enter-to"',
      type: "String",
      range: [20786, 20801],
    },
    {
      text: "await",
      type: "Identifier",
      range: [20815, 20820],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [20821, 20837],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [20845, 20851],
    },
    {
      text: "await",
      type: "Identifier",
      range: [20852, 20857],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [20858, 20867],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [20868, 20889],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [20892, 20899],
    },
    {
      text: "it",
      type: "Identifier",
      range: [20914, 20916],
    },
    {
      text: "todo",
      type: "Identifier",
      range: [20917, 20921],
    },
    {
      text: '"explicit type"',
      type: "String",
      range: [20922, 20937],
    },
    {
      text: "it",
      type: "Identifier",
      range: [20943, 20945],
    },
    {
      text: '"transition cancel (appear/enter/leave)"',
      type: "String",
      range: [20946, 20986],
    },
    {
      text: "async",
      type: "Identifier",
      range: [20988, 20993],
    },
    {
      text: "const",
      type: "Keyword",
      range: [21006, 21011],
    },
    {
      text: "onEnterCancelled",
      type: "Identifier",
      range: [21012, 21028],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [21031, 21035],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [21036, 21038],
    },
    {
      text: "const",
      type: "Keyword",
      range: [21046, 21051],
    },
    {
      text: "onAfterEnter",
      type: "Identifier",
      range: [21052, 21064],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [21067, 21071],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [21072, 21074],
    },
    {
      text: "const",
      type: "Keyword",
      range: [21082, 21087],
    },
    {
      text: "onLeaveCancelled",
      type: "Identifier",
      range: [21088, 21104],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [21107, 21111],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [21112, 21114],
    },
    {
      text: "const",
      type: "Keyword",
      range: [21122, 21127],
    },
    {
      text: "onAfterLeave",
      type: "Identifier",
      range: [21128, 21140],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [21143, 21147],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [21148, 21150],
    },
    {
      text: "const",
      type: "Keyword",
      range: [21158, 21163],
    },
    {
      text: "onAppearCancelled",
      type: "Identifier",
      range: [21164, 21181],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [21184, 21188],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [21189, 21191],
    },
    {
      text: "const",
      type: "Keyword",
      range: [21199, 21204],
    },
    {
      text: "onAfterAppear",
      type: "Identifier",
      range: [21205, 21218],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [21221, 21225],
    },
    {
      text: "fn",
      type: "Identifier",
      range: [21226, 21228],
    },
    {
      text: "const",
      type: "Keyword",
      range: [21237, 21242],
    },
    {
      text: "appearClasses",
      type: "Identifier",
      range: [21243, 21256],
    },
    {
      text: "await",
      type: "Identifier",
      range: [21259, 21264],
    },
    {
      text: "render",
      type: "Identifier",
      range: [21265, 21271],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [21280, 21287],
    },
    {
      text: "true",
      type: "Boolean",
      range: [21289, 21293],
    },
    {
      text: "name",
      type: "Identifier",
      range: [21301, 21305],
    },
    {
      text: '"test"',
      type: "String",
      range: [21307, 21313],
    },
    {
      text: "appear",
      type: "Identifier",
      range: [21321, 21327],
    },
    {
      text: "true",
      type: "Boolean",
      range: [21329, 21333],
    },
    {
      text: "onAfterEnter",
      type: "Identifier",
      range: [21341, 21353],
    },
    {
      text: "onEnterCancelled",
      type: "Identifier",
      range: [21361, 21377],
    },
    {
      text: "onAfterLeave",
      type: "Identifier",
      range: [21385, 21397],
    },
    {
      text: "onLeaveCancelled",
      type: "Identifier",
      range: [21405, 21421],
    },
    {
      text: "onAfterAppear",
      type: "Identifier",
      range: [21429, 21442],
    },
    {
      text: "onAppearCancelled",
      type: "Identifier",
      range: [21450, 21467],
    },
    {
      text: " appear",
      type: "Line",
      range: [21482, 21491],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [21496, 21502],
    },
    {
      text: "appearClasses",
      type: "Identifier",
      range: [21503, 21516],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [21518, 21525],
    },
    {
      text: '"test-enter-from"',
      type: "String",
      range: [21527, 21544],
    },
    {
      text: '"test-enter-active"',
      type: "String",
      range: [21546, 21565],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [21573, 21579],
    },
    {
      text: "onAppearCancelled",
      type: "Identifier",
      range: [21580, 21597],
    },
    {
      text: "not",
      type: "Identifier",
      range: [21599, 21602],
    },
    {
      text: "toBeCalled",
      type: "Identifier",
      range: [21603, 21613],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [21621, 21627],
    },
    {
      text: "onAfterAppear",
      type: "Identifier",
      range: [21628, 21641],
    },
    {
      text: "not",
      type: "Identifier",
      range: [21643, 21646],
    },
    {
      text: "toBeCalled",
      type: "Identifier",
      range: [21647, 21657],
    },
    {
      text: "await",
      type: "Identifier",
      range: [21665, 21670],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [21671, 21680],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [21688, 21694],
    },
    {
      text: "await",
      type: "Identifier",
      range: [21695, 21700],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [21701, 21710],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [21711, 21732],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [21735, 21742],
    },
    {
      text: '"test-enter-active"',
      type: "String",
      range: [21751, 21770],
    },
    {
      text: '"test-enter-to"',
      type: "String",
      range: [21778, 21793],
    },
    {
      text: " leave",
      type: "Line",
      range: [21808, 21816],
    },
    {
      text: "let",
      type: "Keyword",
      range: [21821, 21824],
    },
    {
      text: "leaveClasses",
      type: "Identifier",
      range: [21825, 21837],
    },
    {
      text: "await",
      type: "Identifier",
      range: [21840, 21845],
    },
    {
      text: "render",
      type: "Identifier",
      range: [21846, 21852],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [21855, 21862],
    },
    {
      text: "false",
      type: "Boolean",
      range: [21864, 21869],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [21878, 21884],
    },
    {
      text: "leaveClasses",
      type: "Identifier",
      range: [21885, 21897],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [21899, 21906],
    },
    {
      text: '"test-leave-from"',
      type: "String",
      range: [21908, 21925],
    },
    {
      text: '"test-leave-active"',
      type: "String",
      range: [21927, 21946],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [21954, 21960],
    },
    {
      text: "onAppearCancelled",
      type: "Identifier",
      range: [21961, 21978],
    },
    {
      text: "toBeCalled",
      type: "Identifier",
      range: [21980, 21990],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [21998, 22004],
    },
    {
      text: "onAfterAppear",
      type: "Identifier",
      range: [22005, 22018],
    },
    {
      text: "not",
      type: "Identifier",
      range: [22020, 22023],
    },
    {
      text: "toBeCalled",
      type: "Identifier",
      range: [22024, 22034],
    },
    {
      text: "await",
      type: "Identifier",
      range: [22042, 22047],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [22048, 22057],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [22065, 22071],
    },
    {
      text: "await",
      type: "Identifier",
      range: [22072, 22077],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [22078, 22087],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [22088, 22109],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [22112, 22119],
    },
    {
      text: '"test-leave-active"',
      type: "String",
      range: [22128, 22147],
    },
    {
      text: '"test-leave-to"',
      type: "String",
      range: [22155, 22170],
    },
    {
      text: " enter",
      type: "Line",
      range: [22185, 22193],
    },
    {
      text: "const",
      type: "Keyword",
      range: [22198, 22203],
    },
    {
      text: "enterClasses",
      type: "Identifier",
      range: [22204, 22216],
    },
    {
      text: "await",
      type: "Identifier",
      range: [22219, 22224],
    },
    {
      text: "render",
      type: "Identifier",
      range: [22225, 22231],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [22234, 22241],
    },
    {
      text: "true",
      type: "Boolean",
      range: [22243, 22247],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [22256, 22262],
    },
    {
      text: "enterClasses",
      type: "Identifier",
      range: [22263, 22275],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [22277, 22284],
    },
    {
      text: '"test-enter-from"',
      type: "String",
      range: [22286, 22303],
    },
    {
      text: '"test-enter-active"',
      type: "String",
      range: [22305, 22324],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [22332, 22338],
    },
    {
      text: "onLeaveCancelled",
      type: "Identifier",
      range: [22339, 22355],
    },
    {
      text: "toBeCalled",
      type: "Identifier",
      range: [22357, 22367],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [22375, 22381],
    },
    {
      text: "onAfterLeave",
      type: "Identifier",
      range: [22382, 22394],
    },
    {
      text: "not",
      type: "Identifier",
      range: [22396, 22399],
    },
    {
      text: "toBeCalled",
      type: "Identifier",
      range: [22400, 22410],
    },
    {
      text: "await",
      type: "Identifier",
      range: [22418, 22423],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [22424, 22433],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [22441, 22447],
    },
    {
      text: "await",
      type: "Identifier",
      range: [22448, 22453],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [22454, 22463],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [22464, 22485],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [22488, 22495],
    },
    {
      text: '"test-enter-active"',
      type: "String",
      range: [22504, 22523],
    },
    {
      text: '"test-enter-to"',
      type: "String",
      range: [22531, 22546],
    },
    {
      text: "leaveClasses",
      type: "Identifier",
      range: [22561, 22573],
    },
    {
      text: "await",
      type: "Identifier",
      range: [22576, 22581],
    },
    {
      text: "render",
      type: "Identifier",
      range: [22582, 22588],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [22591, 22598],
    },
    {
      text: "false",
      type: "Boolean",
      range: [22600, 22605],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [22614, 22620],
    },
    {
      text: "leaveClasses",
      type: "Identifier",
      range: [22621, 22633],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [22635, 22642],
    },
    {
      text: '"test-leave-from"',
      type: "String",
      range: [22644, 22661],
    },
    {
      text: '"test-leave-active"',
      type: "String",
      range: [22663, 22682],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [22690, 22696],
    },
    {
      text: "onAfterEnter",
      type: "Identifier",
      range: [22697, 22709],
    },
    {
      text: "not",
      type: "Identifier",
      range: [22711, 22714],
    },
    {
      text: "toBeCalled",
      type: "Identifier",
      range: [22715, 22725],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [22733, 22739],
    },
    {
      text: "onEnterCancelled",
      type: "Identifier",
      range: [22740, 22756],
    },
    {
      text: "toBeCalled",
      type: "Identifier",
      range: [22758, 22768],
    },
    {
      text: "await",
      type: "Identifier",
      range: [22777, 22782],
    },
    {
      text: "nextFrame",
      type: "Identifier",
      range: [22783, 22792],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [22800, 22806],
    },
    {
      text: "await",
      type: "Identifier",
      range: [22807, 22812],
    },
    {
      text: "classList",
      type: "Identifier",
      range: [22813, 22822],
    },
    {
      text: '"#transition-element"',
      type: "String",
      range: [22823, 22844],
    },
    {
      text: "toEqual",
      type: "Identifier",
      range: [22847, 22854],
    },
    {
      text: '"test-leave-active"',
      type: "String",
      range: [22863, 22882],
    },
    {
      text: '"test-leave-to"',
      type: "String",
      range: [22890, 22905],
    },
    {
      text: "await",
      type: "Identifier",
      range: [22919, 22924],
    },
    {
      text: "transitionFinish",
      type: "Identifier",
      range: [22925, 22941],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [22949, 22955],
    },
    {
      text: "await",
      type: "Identifier",
      range: [22956, 22961],
    },
    {
      text: "html",
      type: "Identifier",
      range: [22962, 22966],
    },
    {
      text: '"#container"',
      type: "String",
      range: [22967, 22979],
    },
    {
      text: "toBe",
      type: "Identifier",
      range: [22982, 22986],
    },
    {
      text: '""',
      type: "String",
      range: [22987, 22989],
    },
    {
      text: "it",
      type: "Identifier",
      range: [23001, 23003],
    },
    {
      text: '"warn if wrong children"',
      type: "String",
      range: [23004, 23028],
    },
    {
      text: "async",
      type: "Identifier",
      range: [23030, 23035],
    },
    {
      text: "const",
      type: "Keyword",
      range: [23048, 23053],
    },
    {
      text: "consoleErrorSpy",
      type: "Identifier",
      range: [23054, 23069],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [23072, 23076],
    },
    {
      text: "spyOn",
      type: "Identifier",
      range: [23077, 23082],
    },
    {
      text: "console",
      type: "Identifier",
      range: [23083, 23090],
    },
    {
      text: '"error"',
      type: "String",
      range: [23092, 23099],
    },
    {
      text: "await",
      type: "Identifier",
      range: [23107, 23112],
    },
    {
      text: "page",
      type: "Identifier",
      range: [23113, 23117],
    },
    {
      text: "evaluate",
      type: "Identifier",
      range: [23120, 23128],
    },
    {
      text: "return",
      type: "Keyword",
      range: [23143, 23149],
    },
    {
      text: "new",
      type: "Keyword",
      range: [23150, 23153],
    },
    {
      text: "Promise",
      type: "Identifier",
      range: [23154, 23161],
    },
    {
      text: "res",
      type: "Identifier",
      range: [23162, 23165],
    },
    {
      text: "const",
      type: "Keyword",
      range: [23179, 23184],
    },
    {
      text: "React",
      type: "Identifier",
      range: [23187, 23192],
    },
    {
      text: "ReactDOM",
      type: "Identifier",
      range: [23194, 23202],
    },
    {
      text: "Retransition",
      type: "Identifier",
      range: [23204, 23216],
    },
    {
      text: "window",
      type: "Identifier",
      range: [23221, 23227],
    },
    {
      text: "as",
      type: "Identifier",
      range: [23228, 23230],
    },
    {
      text: "any",
      type: "Identifier",
      range: [23231, 23234],
    },
    {
      text: "const",
      type: "Keyword",
      range: [23244, 23249],
    },
    {
      text: "Transition",
      type: "Identifier",
      range: [23252, 23262],
    },
    {
      text: "Retransition",
      type: "Identifier",
      range: [23267, 23279],
    },
    {
      text: "const",
      type: "Keyword",
      range: [23289, 23294],
    },
    {
      text: "baseElement",
      type: "Identifier",
      range: [23295, 23306],
    },
    {
      text: "document",
      type: "Identifier",
      range: [23309, 23317],
    },
    {
      text: "querySelector",
      type: "Identifier",
      range: [23318, 23331],
    },
    {
      text: '"#app"',
      type: "String",
      range: [23332, 23338],
    },
    {
      text: "ReactDOM",
      type: "Identifier",
      range: [23351, 23359],
    },
    {
      text: "render",
      type: "Identifier",
      range: [23360, 23366],
    },
    {
      text: "Transition",
      type: "JSXIdentifier",
      range: [23379, 23389],
    },
    {
      text: "visible",
      type: "JSXIdentifier",
      range: [23390, 23397],
    },
    {
      text: "true",
      type: "Boolean",
      range: [23399, 23403],
    },
    {
      text: "Transition",
      type: "JSXIdentifier",
      range: [23407, 23417],
    },
    {
      text: "baseElement",
      type: "Identifier",
      range: [23430, 23441],
    },
    {
      text: "res",
      type: "Identifier",
      range: [23453, 23456],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [23491, 23497],
    },
    {
      text: "consoleErrorSpy",
      type: "Identifier",
      range: [23498, 23513],
    },
    {
      text: "toBeCalled",
      type: "Identifier",
      range: [23515, 23525],
    },
    {
      text: "it",
      type: "Identifier",
      range: [23538, 23540],
    },
    {
      text: "each",
      type: "Identifier",
      range: [23541, 23545],
    },
    {
      text: '"object"',
      type: "String",
      range: [23547, 23555],
    },
    {
      text: '"function"',
      type: "String",
      range: [23557, 23567],
    },
    {
      text: '"should work with %s refs"',
      type: "String",
      range: [23570, 23596],
    },
    {
      text: "async",
      type: "Identifier",
      range: [23598, 23603],
    },
    {
      text: "refType",
      type: "Identifier",
      range: [23604, 23611],
    },
    {
      text: " ref mount",
      type: "Line",
      range: [23621, 23633],
    },
    {
      text: "let",
      type: "Keyword",
      range: [23638, 23641],
    },
    {
      text: "passed",
      type: "Identifier",
      range: [23642, 23648],
    },
    {
      text: "await",
      type: "Identifier",
      range: [23651, 23656],
    },
    {
      text: "page",
      type: "Identifier",
      range: [23657, 23661],
    },
    {
      text: "evaluate",
      type: "Identifier",
      range: [23664, 23672],
    },
    {
      text: "refType",
      type: "Identifier",
      range: [23683, 23690],
    },
    {
      text: "return",
      type: "Keyword",
      range: [23707, 23713],
    },
    {
      text: "new",
      type: "Keyword",
      range: [23714, 23717],
    },
    {
      text: "Promise",
      type: "Identifier",
      range: [23718, 23725],
    },
    {
      text: "res",
      type: "Identifier",
      range: [23726, 23729],
    },
    {
      text: "const",
      type: "Keyword",
      range: [23745, 23750],
    },
    {
      text: "React",
      type: "Identifier",
      range: [23753, 23758],
    },
    {
      text: "ReactDOM",
      type: "Identifier",
      range: [23760, 23768],
    },
    {
      text: "Retransition",
      type: "Identifier",
      range: [23770, 23782],
    },
    {
      text: "window",
      type: "Identifier",
      range: [23787, 23793],
    },
    {
      text: "as",
      type: "Identifier",
      range: [23794, 23796],
    },
    {
      text: "any",
      type: "Identifier",
      range: [23797, 23800],
    },
    {
      text: "const",
      type: "Keyword",
      range: [23812, 23817],
    },
    {
      text: "Transition",
      type: "Identifier",
      range: [23818, 23828],
    },
    {
      text: "React",
      type: "Identifier",
      range: [23830, 23835],
    },
    {
      text: "FC",
      type: "Identifier",
      range: [23836, 23838],
    },
    {
      text: "TransitionProps",
      type: "Identifier",
      range: [23839, 23854],
    },
    {
      text: "Retransition",
      type: "Identifier",
      range: [23858, 23870],
    },
    {
      text: "Transition",
      type: "Identifier",
      range: [23871, 23881],
    },
    {
      text: "const",
      type: "Keyword",
      range: [23893, 23898],
    },
    {
      text: "baseElement",
      type: "Identifier",
      range: [23899, 23910],
    },
    {
      text: "document",
      type: "Identifier",
      range: [23913, 23921],
    },
    {
      text: "querySelector",
      type: "Identifier",
      range: [23922, 23935],
    },
    {
      text: '"#app"',
      type: "String",
      range: [23936, 23942],
    },
    {
      text: "let",
      type: "Keyword",
      range: [23956, 23959],
    },
    {
      text: "ref",
      type: "Identifier",
      range: [23960, 23963],
    },
    {
      text: "any",
      type: "Identifier",
      range: [23965, 23968],
    },
    {
      text: "const",
      type: "Keyword",
      range: [23980, 23985],
    },
    {
      text: "Component",
      type: "Identifier",
      range: [23986, 23995],
    },
    {
      text: "ref",
      type: "Identifier",
      range: [24018, 24021],
    },
    {
      text: "refType",
      type: "Identifier",
      range: [24038, 24045],
    },
    {
      text: '"object"',
      type: "String",
      range: [24050, 24058],
    },
    {
      text: "React",
      type: "Identifier",
      range: [24077, 24082],
    },
    {
      text: "useRef",
      type: "Identifier",
      range: [24083, 24089],
    },
    {
      text: "null",
      type: "Keyword",
      range: [24090, 24094],
    },
    {
      text: "el",
      type: "Identifier",
      range: [24115, 24117],
    },
    {
      text: "any",
      type: "Identifier",
      range: [24119, 24122],
    },
    {
      text: "ref",
      type: "Identifier",
      range: [24128, 24131],
    },
    {
      text: "current",
      type: "Identifier",
      range: [24136, 24143],
    },
    {
      text: "el",
      type: "Identifier",
      range: [24145, 24147],
    },
    {
      text: "React",
      type: "Identifier",
      range: [24164, 24169],
    },
    {
      text: "useEffect",
      type: "Identifier",
      range: [24170, 24179],
    },
    {
      text: "if",
      type: "Keyword",
      range: [24202, 24204],
    },
    {
      text: "ref",
      type: "Identifier",
      range: [24206, 24209],
    },
    {
      text: "current",
      type: "Identifier",
      range: [24210, 24217],
    },
    {
      text: "instanceof",
      type: "Keyword",
      range: [24218, 24228],
    },
    {
      text: "HTMLElement",
      type: "Identifier",
      range: [24229, 24240],
    },
    {
      text: "return",
      type: "Keyword",
      range: [24260, 24266],
    },
    {
      text: "res",
      type: "Identifier",
      range: [24267, 24270],
    },
    {
      text: "true",
      type: "Boolean",
      range: [24271, 24275],
    },
    {
      text: "res",
      type: "Identifier",
      range: [24308, 24311],
    },
    {
      text: "false",
      type: "Boolean",
      range: [24312, 24317],
    },
    {
      text: "return",
      type: "Keyword",
      range: [24352, 24358],
    },
    {
      text: "Transition",
      type: "JSXIdentifier",
      range: [24376, 24386],
    },
    {
      text: "visible",
      type: "JSXIdentifier",
      range: [24387, 24394],
    },
    {
      text: "true",
      type: "Boolean",
      range: [24396, 24400],
    },
    {
      text: "nodeRef",
      type: "JSXIdentifier",
      range: [24402, 24409],
    },
    {
      text: "ref",
      type: "Identifier",
      range: [24411, 24414],
    },
    {
      text: "\n                ",
      type: "JSXText",
      range: [24416, 24433],
    },
    {
      text: "ref",
      type: "Identifier",
      range: [24437, 24440],
    },
    {
      text: "div",
      type: "JSXIdentifier",
      range: [24448, 24451],
    },
    {
      text: "ref",
      type: "JSXIdentifier",
      range: [24452, 24455],
    },
    {
      text: "ref",
      type: "Identifier",
      range: [24457, 24460],
    },
    {
      text: "Hello world",
      type: "JSXText",
      range: [24462, 24473],
    },
    {
      text: "div",
      type: "JSXIdentifier",
      range: [24475, 24478],
    },
    {
      text: "\n              ",
      type: "JSXText",
      range: [24480, 24495],
    },
    {
      text: "Transition",
      type: "JSXIdentifier",
      range: [24497, 24507],
    },
    {
      text: "ReactDOM",
      type: "Identifier",
      range: [24547, 24555],
    },
    {
      text: "render",
      type: "Identifier",
      range: [24556, 24562],
    },
    {
      text: "Component",
      type: "JSXIdentifier",
      range: [24564, 24573],
    },
    {
      text: "baseElement",
      type: "Identifier",
      range: [24578, 24589],
    },
    {
      text: "refType",
      type: "Identifier",
      range: [24621, 24628],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [24642, 24648],
    },
    {
      text: "passed",
      type: "Identifier",
      range: [24649, 24655],
    },
    {
      text: "toBe",
      type: "Identifier",
      range: [24657, 24661],
    },
    {
      text: "true",
      type: "Boolean",
      range: [24662, 24666],
    },
    {
      text: " ref unmount",
      type: "Line",
      range: [24673, 24687],
    },
    {
      text: "passed",
      type: "Identifier",
      range: [24692, 24698],
    },
    {
      text: "await",
      type: "Identifier",
      range: [24701, 24706],
    },
    {
      text: "page",
      type: "Identifier",
      range: [24707, 24711],
    },
    {
      text: "evaluate",
      type: "Identifier",
      range: [24714, 24722],
    },
    {
      text: "refType",
      type: "Identifier",
      range: [24733, 24740],
    },
    {
      text: "return",
      type: "Keyword",
      range: [24757, 24763],
    },
    {
      text: "new",
      type: "Keyword",
      range: [24764, 24767],
    },
    {
      text: "Promise",
      type: "Identifier",
      range: [24768, 24775],
    },
    {
      text: "res",
      type: "Identifier",
      range: [24776, 24779],
    },
    {
      text: "const",
      type: "Keyword",
      range: [24795, 24800],
    },
    {
      text: "React",
      type: "Identifier",
      range: [24803, 24808],
    },
    {
      text: "ReactDOM",
      type: "Identifier",
      range: [24810, 24818],
    },
    {
      text: "Retransition",
      type: "Identifier",
      range: [24820, 24832],
    },
    {
      text: "window",
      type: "Identifier",
      range: [24837, 24843],
    },
    {
      text: "as",
      type: "Identifier",
      range: [24844, 24846],
    },
    {
      text: "any",
      type: "Identifier",
      range: [24847, 24850],
    },
    {
      text: "const",
      type: "Keyword",
      range: [24862, 24867],
    },
    {
      text: "Transition",
      type: "Identifier",
      range: [24868, 24878],
    },
    {
      text: "React",
      type: "Identifier",
      range: [24880, 24885],
    },
    {
      text: "FC",
      type: "Identifier",
      range: [24886, 24888],
    },
    {
      text: "TransitionProps",
      type: "Identifier",
      range: [24889, 24904],
    },
    {
      text: "Retransition",
      type: "Identifier",
      range: [24908, 24920],
    },
    {
      text: "Transition",
      type: "Identifier",
      range: [24921, 24931],
    },
    {
      text: "const",
      type: "Keyword",
      range: [24943, 24948],
    },
    {
      text: "baseElement",
      type: "Identifier",
      range: [24949, 24960],
    },
    {
      text: "document",
      type: "Identifier",
      range: [24963, 24971],
    },
    {
      text: "querySelector",
      type: "Identifier",
      range: [24972, 24985],
    },
    {
      text: '"#app"',
      type: "String",
      range: [24986, 24992],
    },
    {
      text: "let",
      type: "Keyword",
      range: [25006, 25009],
    },
    {
      text: "ref",
      type: "Identifier",
      range: [25010, 25013],
    },
    {
      text: "any",
      type: "Identifier",
      range: [25015, 25018],
    },
    {
      text: "const",
      type: "Keyword",
      range: [25030, 25035],
    },
    {
      text: "Component",
      type: "Identifier",
      range: [25036, 25045],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [25051, 25058],
    },
    {
      text: "true",
      type: "Boolean",
      range: [25061, 25065],
    },
    {
      text: "ref",
      type: "Identifier",
      range: [25086, 25089],
    },
    {
      text: "refType",
      type: "Identifier",
      range: [25106, 25113],
    },
    {
      text: '"object"',
      type: "String",
      range: [25118, 25126],
    },
    {
      text: "React",
      type: "Identifier",
      range: [25145, 25150],
    },
    {
      text: "useRef",
      type: "Identifier",
      range: [25151, 25157],
    },
    {
      text: "null",
      type: "Keyword",
      range: [25158, 25162],
    },
    {
      text: "el",
      type: "Identifier",
      range: [25183, 25185],
    },
    {
      text: "any",
      type: "Identifier",
      range: [25187, 25190],
    },
    {
      text: "ref",
      type: "Identifier",
      range: [25196, 25199],
    },
    {
      text: "current",
      type: "Identifier",
      range: [25204, 25211],
    },
    {
      text: "el",
      type: "Identifier",
      range: [25213, 25215],
    },
    {
      text: "return",
      type: "Keyword",
      range: [25232, 25238],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [25239, 25246],
    },
    {
      text: "Transition",
      type: "JSXIdentifier",
      range: [25266, 25276],
    },
    {
      text: "visible",
      type: "JSXIdentifier",
      range: [25277, 25284],
    },
    {
      text: "true",
      type: "Boolean",
      range: [25286, 25290],
    },
    {
      text: "nodeRef",
      type: "JSXIdentifier",
      range: [25292, 25299],
    },
    {
      text: "ref",
      type: "Identifier",
      range: [25301, 25304],
    },
    {
      text: "\n                ",
      type: "JSXText",
      range: [25306, 25323],
    },
    {
      text: "ref",
      type: "Identifier",
      range: [25327, 25330],
    },
    {
      text: "div",
      type: "JSXIdentifier",
      range: [25338, 25341],
    },
    {
      text: "ref",
      type: "JSXIdentifier",
      range: [25342, 25345],
    },
    {
      text: "ref",
      type: "Identifier",
      range: [25347, 25350],
    },
    {
      text: "Hello world",
      type: "JSXText",
      range: [25352, 25363],
    },
    {
      text: "div",
      type: "JSXIdentifier",
      range: [25365, 25368],
    },
    {
      text: "\n              ",
      type: "JSXText",
      range: [25370, 25385],
    },
    {
      text: "Transition",
      type: "JSXIdentifier",
      range: [25387, 25397],
    },
    {
      text: "null",
      type: "Keyword",
      range: [25415, 25419],
    },
    {
      text: "ReactDOM",
      type: "Identifier",
      range: [25444, 25452],
    },
    {
      text: "render",
      type: "Identifier",
      range: [25453, 25459],
    },
    {
      text: "Component",
      type: "JSXIdentifier",
      range: [25461, 25470],
    },
    {
      text: "baseElement",
      type: "Identifier",
      range: [25475, 25486],
    },
    {
      text: "if",
      type: "Keyword",
      range: [25508, 25510],
    },
    {
      text: "ref",
      type: "Identifier",
      range: [25514, 25517],
    },
    {
      text: "current",
      type: "Identifier",
      range: [25518, 25525],
    },
    {
      text: "instanceof",
      type: "Keyword",
      range: [25526, 25536],
    },
    {
      text: "HTMLElement",
      type: "Identifier",
      range: [25537, 25548],
    },
    {
      text: "throw",
      type: "Keyword",
      range: [25567, 25572],
    },
    {
      text: "new",
      type: "Keyword",
      range: [25573, 25576],
    },
    {
      text: "Error",
      type: "Identifier",
      range: [25577, 25582],
    },
    {
      text: '"didn\'t assigned ref"',
      type: "String",
      range: [25583, 25604],
    },
    {
      text: "ReactDOM",
      type: "Identifier",
      range: [25633, 25641],
    },
    {
      text: "render",
      type: "Identifier",
      range: [25642, 25648],
    },
    {
      text: "Component",
      type: "JSXIdentifier",
      range: [25650, 25659],
    },
    {
      text: "visible",
      type: "JSXIdentifier",
      range: [25660, 25667],
    },
    {
      text: "false",
      type: "Boolean",
      range: [25669, 25674],
    },
    {
      text: "baseElement",
      type: "Identifier",
      range: [25680, 25691],
    },
    {
      text: " the ref was cleanedup",
      type: "Line",
      range: [25715, 25739],
    },
    {
      text: "if",
      type: "Keyword",
      range: [25754, 25756],
    },
    {
      text: "ref",
      type: "Identifier",
      range: [25758, 25761],
    },
    {
      text: "current",
      type: "Identifier",
      range: [25762, 25769],
    },
    {
      text: "null",
      type: "Keyword",
      range: [25774, 25778],
    },
    {
      text: "return",
      type: "Keyword",
      range: [25798, 25804],
    },
    {
      text: "res",
      type: "Identifier",
      range: [25805, 25808],
    },
    {
      text: "true",
      type: "Boolean",
      range: [25809, 25813],
    },
    {
      text: "res",
      type: "Identifier",
      range: [25846, 25849],
    },
    {
      text: "false",
      type: "Boolean",
      range: [25850, 25855],
    },
    {
      text: "refType",
      type: "Identifier",
      range: [25917, 25924],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [25938, 25944],
    },
    {
      text: "passed",
      type: "Identifier",
      range: [25945, 25951],
    },
    {
      text: "toBe",
      type: "Identifier",
      range: [25953, 25957],
    },
    {
      text: "true",
      type: "Boolean",
      range: [25958, 25962],
    },
    {
      text: "it",
      type: "Identifier",
      range: [25974, 25976],
    },
    {
      text: "skip",
      type: "Identifier",
      range: [25977, 25981],
    },
    {
      text: '"should not show error about unmounted component state modification"',
      type: "String",
      range: [25982, 26050],
    },
    {
      text: "async",
      type: "Identifier",
      range: [26052, 26057],
    },
    {
      text: "const",
      type: "Keyword",
      range: [26070, 26075],
    },
    {
      text: "consoleErrorSpy",
      type: "Identifier",
      range: [26076, 26091],
    },
    {
      text: "jest",
      type: "Identifier",
      range: [26094, 26098],
    },
    {
      text: "spyOn",
      type: "Identifier",
      range: [26099, 26104],
    },
    {
      text: "console",
      type: "Identifier",
      range: [26105, 26112],
    },
    {
      text: '"error"',
      type: "String",
      range: [26114, 26121],
    },
    {
      text: "await",
      type: "Identifier",
      range: [26129, 26134],
    },
    {
      text: "page",
      type: "Identifier",
      range: [26135, 26139],
    },
    {
      text: "evaluate",
      type: "Identifier",
      range: [26142, 26150],
    },
    {
      text: "return",
      type: "Keyword",
      range: [26165, 26171],
    },
    {
      text: "new",
      type: "Keyword",
      range: [26172, 26175],
    },
    {
      text: "Promise",
      type: "Identifier",
      range: [26176, 26183],
    },
    {
      text: "res",
      type: "Identifier",
      range: [26184, 26187],
    },
    {
      text: "const",
      type: "Keyword",
      range: [26201, 26206],
    },
    {
      text: "React",
      type: "Identifier",
      range: [26209, 26214],
    },
    {
      text: "ReactDOM",
      type: "Identifier",
      range: [26216, 26224],
    },
    {
      text: "Retransition",
      type: "Identifier",
      range: [26226, 26238],
    },
    {
      text: "window",
      type: "Identifier",
      range: [26243, 26249],
    },
    {
      text: "as",
      type: "Identifier",
      range: [26250, 26252],
    },
    {
      text: "any",
      type: "Identifier",
      range: [26253, 26256],
    },
    {
      text: "const",
      type: "Keyword",
      range: [26266, 26271],
    },
    {
      text: "Transition",
      type: "Identifier",
      range: [26272, 26282],
    },
    {
      text: "React",
      type: "Identifier",
      range: [26284, 26289],
    },
    {
      text: "FC",
      type: "Identifier",
      range: [26290, 26292],
    },
    {
      text: "TransitionProps",
      type: "Identifier",
      range: [26293, 26308],
    },
    {
      text: "Retransition",
      type: "Identifier",
      range: [26312, 26324],
    },
    {
      text: "Transition",
      type: "Identifier",
      range: [26325, 26335],
    },
    {
      text: "const",
      type: "Keyword",
      range: [26345, 26350],
    },
    {
      text: "baseElement",
      type: "Identifier",
      range: [26351, 26362],
    },
    {
      text: "document",
      type: "Identifier",
      range: [26365, 26373],
    },
    {
      text: "querySelector",
      type: "Identifier",
      range: [26374, 26387],
    },
    {
      text: '"#app"',
      type: "String",
      range: [26388, 26394],
    },
    {
      text: "const",
      type: "Keyword",
      range: [26407, 26412],
    },
    {
      text: "Component",
      type: "Identifier",
      range: [26413, 26422],
    },
    {
      text: "const",
      type: "Keyword",
      range: [26443, 26448],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [26450, 26457],
    },
    {
      text: "setVisible",
      type: "Identifier",
      range: [26459, 26469],
    },
    {
      text: "React",
      type: "Identifier",
      range: [26473, 26478],
    },
    {
      text: "useState",
      type: "Identifier",
      range: [26479, 26487],
    },
    {
      text: "true",
      type: "Boolean",
      range: [26488, 26492],
    },
    {
      text: "const",
      type: "Keyword",
      range: [26505, 26510],
    },
    {
      text: "renderNull",
      type: "Identifier",
      range: [26512, 26522],
    },
    {
      text: "setRenderNull",
      type: "Identifier",
      range: [26524, 26537],
    },
    {
      text: "React",
      type: "Identifier",
      range: [26541, 26546],
    },
    {
      text: "useState",
      type: "Identifier",
      range: [26547, 26555],
    },
    {
      text: "false",
      type: "Boolean",
      range: [26556, 26561],
    },
    {
      text: "React",
      type: "Identifier",
      range: [26575, 26580],
    },
    {
      text: "useEffect",
      type: "Identifier",
      range: [26581, 26590],
    },
    {
      text: " will run leave animation",
      type: "Line",
      range: [26611, 26638],
    },
    {
      text: "setVisible",
      type: "Identifier",
      range: [26651, 26661],
    },
    {
      text: "false",
      type: "Boolean",
      range: [26662, 26667],
    },
    {
      text: "window",
      type: "Identifier",
      range: [26682, 26688],
    },
    {
      text: "setTimeout",
      type: "Identifier",
      range: [26689, 26699],
    },
    {
      text: " should trigger leave animation",
      type: "Line",
      range: [26722, 26755],
    },
    {
      text: "setRenderNull",
      type: "Identifier",
      range: [26770, 26783],
    },
    {
      text: "true",
      type: "Boolean",
      range: [26784, 26788],
    },
    {
      text: "setTimeout",
      type: "Identifier",
      range: [26805, 26815],
    },
    {
      text: "res",
      type: "Identifier",
      range: [26840, 26843],
    },
    {
      text: "undefined",
      type: "Identifier",
      range: [26844, 26853],
    },
    {
      text: "100",
      type: "Numeric",
      range: [26873, 26876],
    },
    {
      text: "25",
      type: "Numeric",
      range: [26894, 26896],
    },
    {
      text: "if",
      type: "Keyword",
      range: [26928, 26930],
    },
    {
      text: "renderNull",
      type: "Identifier",
      range: [26932, 26942],
    },
    {
      text: "return",
      type: "Keyword",
      range: [26958, 26964],
    },
    {
      text: "null",
      type: "Keyword",
      range: [26965, 26969],
    },
    {
      text: "return",
      type: "Keyword",
      range: [26994, 27000],
    },
    {
      text: "Transition",
      type: "JSXIdentifier",
      range: [27016, 27026],
    },
    {
      text: "visible",
      type: "JSXIdentifier",
      range: [27027, 27034],
    },
    {
      text: "visible",
      type: "Identifier",
      range: [27036, 27043],
    },
    {
      text: "name",
      type: "JSXIdentifier",
      range: [27045, 27049],
    },
    {
      text: '"test"',
      type: "JSXText",
      range: [27050, 27056],
    },
    {
      text: "\n              ",
      type: "JSXText",
      range: [27057, 27072],
    },
    {
      text: "ref",
      type: "Identifier",
      range: [27076, 27079],
    },
    {
      text: "div",
      type: "JSXIdentifier",
      range: [27087, 27090],
    },
    {
      text: "ref",
      type: "JSXIdentifier",
      range: [27091, 27094],
    },
    {
      text: "ref",
      type: "Identifier",
      range: [27096, 27099],
    },
    {
      text: "Hello world",
      type: "JSXText",
      range: [27101, 27112],
    },
    {
      text: "div",
      type: "JSXIdentifier",
      range: [27114, 27117],
    },
    {
      text: "\n            ",
      type: "JSXText",
      range: [27119, 27132],
    },
    {
      text: "Transition",
      type: "JSXIdentifier",
      range: [27134, 27144],
    },
    {
      text: "ReactDOM",
      type: "Identifier",
      range: [27179, 27187],
    },
    {
      text: "render",
      type: "Identifier",
      range: [27188, 27194],
    },
    {
      text: "Component",
      type: "JSXIdentifier",
      range: [27196, 27205],
    },
    {
      text: "baseElement",
      type: "Identifier",
      range: [27210, 27221],
    },
    {
      text: "expect",
      type: "Identifier",
      range: [27247, 27253],
    },
    {
      text: "consoleErrorSpy",
      type: "Identifier",
      range: [27254, 27269],
    },
    {
      text: "not",
      type: "Identifier",
      range: [27271, 27274],
    },
    {
      text: "toBeCalled",
      type: "Identifier",
      range: [27275, 27285],
    },
    {
      text: "it",
      type: "Identifier",
      range: [27298, 27300],
    },
    {
      text: "todo",
      type: "Identifier",
      range: [27301, 27305],
    },
    {
      text: '"`unmount: false, visible: false` shouldn\'t run enter animation on initial render"',
      type: "String",
      range: [27311, 27393],
    },
    {
      text: " async () => {}",
      type: "Line",
      range: [27398, 27415],
    },
    {
      text: "it",
      type: "Identifier",
      range: [27424, 27426],
    },
    {
      text: "todo",
      type: "Identifier",
      range: [27427, 27431],
    },
    {
      text: '"should preserve elements display with unmount - false"',
      type: "String",
      range: [27432, 27487],
    },
  ],
};

export function App() {
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [settings, setSettings] = useLocalStorage<Settings>("settings", {
    type: DEFAULT_TYPE,
    duration: 20,
    width: 1200,
  });

  const { testData: _, status } = useTestQuery(settings.type);

  const handleSettingsOpen = () => {
    setSettingsModalOpen(true);
  };

  const handleSettingsClose = () => {
    setSettingsModalOpen(false);
  };

  const renderContent = () => {
    if (status === "error") {
      return <div>Error happened...</div>;
    }

    if (status === "pending") {
      return <div>Loading...</div>;
    }

    return (
      <TypingTest
        timeDuration={settings.duration}
        inputText={testData?.text ?? ""}
        wordsConfig={testData?.words ?? []}
        width={settings.width}
      />
    );
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          height: 50,
          padding: "0 16px",
        }}
      >
        <button onClick={handleSettingsOpen}>Settings</button>
        <SettingsModal
          open={settingsModalOpen}
          onClose={handleSettingsClose}
          settings={settings}
          onSettingsChange={setSettings}
        />
      </header>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
}
