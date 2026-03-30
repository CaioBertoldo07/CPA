import { AppError } from '../middleware/errorMiddleware';

/**
 * Accepts questão IDs in any of three forms and returns a deduplicated
 * array of plain integers:
 *   - number       → used as-is
 *   - string "5"   → parsed as integer
 *   - "5___label"  → virtual ID from repetir_todas_disciplinas expansion;
 *                    only the base number before "___" is kept
 *
 * Throws AppError 400 listing every entry that cannot be converted.
 */
export function normalizeQuestaoIds(questoes: any[]): number[] {
    const invalid: any[] = [];
    const result: number[] = [];

    for (const q of questoes) {
        if (typeof q === 'number' && Number.isFinite(q)) {
            result.push(q);
            continue;
        }
        const str = String(q);
        // Strip virtual suffix produced by repetir_todas_disciplinas
        const match = str.match(/^(\d+)___/);
        const parsed = match ? parseInt(match[1], 10) : parseInt(str, 10);

        if (Number.isFinite(parsed)) {
            result.push(parsed);
        } else {
            invalid.push(q);
        }
    }

    if (invalid.length > 0) {
        throw new AppError(
            `Questões com IDs inválidos (não convertíveis para número): ${invalid.map(String).join(', ')}`,
            400,
        );
    }

    // Deduplicate: virtual IDs for the same question across N disciplines
    // all resolve to the same base ID
    return [...new Set(result)];
}
