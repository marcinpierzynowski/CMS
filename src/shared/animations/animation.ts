import {
  trigger,
  state,
  keyframes,
  style,
  transition,
  animate,
  animation
} from "@angular/animations";

export const fadeInOutTranslate = trigger("fadeInOutTranslate", [
  transition(":enter", [
    style({ opacity: 0 }),
    animate("400ms ease-in-out", style({ opacity: 1 }))
  ])
]);

export const fadeOutTranslate = trigger("fadeOutTranslate", [
  transition(":leave", [
    style({ opacity: 1 }),
    animate("400ms ease-in-out", style({ opacity: 0 }))
  ])
]);

export const fadeInOutTranslateInOpacity = trigger("fadeInOutTranslateInOpacity", [
  transition(":enter", [
    style({ opacity: 0 }),
    animate("400ms ease-in-out", style({ opacity: 0.3 }))
  ])
]);

export const fadeOutTranslateInOpacity = trigger("fadeOutTranslateInOpacity", [
  transition(":leave", [
    style({ opacity: 0.3 }),
    animate("400ms ease-in-out", style({ opacity: 0 }))
  ])
]);

export const flipInX = trigger("flipInX", [
  transition(
    ":enter",
    animate(
      "800ms ease-in",
      keyframes([
        style({ transform: "perspective(400px) rotate3d(1, 0, 0, 90deg)" }),
        style({ transform: "perspective(400px) rotate3d(1, 0, 0, -20deg)" }),
        style({ transform: "perspective(400px) rotate3d(1, 0, 0, 10deg)" }),
        style({ transform: "perspective(400px) rotate3d(1, 0, 0, -5deg)" }),
        style({ transform: "perspective(400px)" })
      ])
    )
  )
]);

export const fadeInDown = trigger("fadeInDown", [
  transition(
    ":enter",
    animate(
      "400ms ease-in",
      keyframes([
        style({ transform: "translate3d(0, -100%, 0)", opacity: 0 }),
        style({ transform: "translate3d(0, 0, 0)", opacity: 1 })
      ])
    )
  )
]);

export const fadeOutUp = trigger("fadeOutUp", [
  transition(
    ":leave",
    animate(
      "400ms ease-in",
      keyframes([
        style({ opacity: 1 }),
        style({ transform: "translate3d(0, -100%, 0)", opacity: 0 })
      ])
    )
  )
]);
