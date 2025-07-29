import { parseTiempoLimpieza } from "@/utils/functions/functions"

describe("Parsear bien la hora de limpieza", () => {
    it("Parsear la hora de limpieza correctamente", () => {
        expect(parseTiempoLimpieza("1:45")).toBe(1.75)
    })
})