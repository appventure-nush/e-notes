import Vue from 'vue'
import generate from "@/mixins/keys";
import Config from "@/store/config";

export const EventBus = new Vue({
    data: () => ({
        uwufy: Boolean(Config.settings.permanentUwufy)
    })
});
generate("as the school flag flies up high", () => new Audio('https://www.nushigh.edu.sg/qql/slot/u90/2020/Our%20DNA/NUSHS%20SONG%20Choir.mp3').play(), true);
generate("never gonna give you up", () => new Audio('/raw/rick.mp3').play(), true);
generate("↑↑↓↓←→←→ab", () => EventBus.uwufy = true);
generate("ilikerainbow", () => document.body.classList.add('rb-lock-off'), true);