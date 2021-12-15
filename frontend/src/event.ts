import Vue from 'vue'
import generate from "@/mixins/keys";

export const EventBus = new Vue();
generate("as the school flag flies up high", () => new Audio('https://www.nushigh.edu.sg/qql/slot/u90/2020/Our%20DNA/NUSHS%20SONG%20Choir.mp3').play(), true);
generate("never gonna give you up", () => new Audio('/raw/rick.mp3').play(), true);
generate("↑↑↓↓←→←→ab", () => EventBus.$emit("uwufy"));
generate("ilikerainbow", () => document.body.classList.add('rb-lock-off'), true);