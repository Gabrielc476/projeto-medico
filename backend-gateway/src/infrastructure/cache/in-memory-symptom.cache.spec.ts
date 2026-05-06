import { describe, it, expect, beforeEach, vi } from "vitest";
import { InMemorySymptomCache } from "./in-memory-symptom.cache";
import { Cache } from "cache-manager";

describe("InMemorySymptomCache", () => {
	let cache: InMemorySymptomCache;
	let mockCacheManager: Cache;

	beforeEach(() => {
		mockCacheManager = {
			get: vi.fn(),
			set: vi.fn(),
			clear: vi.fn(),
			store: {
				keys: vi.fn(),
			},
		} as any;

		cache = new InMemorySymptomCache(mockCacheManager);
	});

	it("should get a symptom from cache manager", async () => {
		const mockSymptom = {
			cui: "C01",
			clinicalName: "Fever",
			laymanTerm: "Febre",
		};
		vi.mocked(mockCacheManager.get).mockResolvedValue(mockSymptom);

		const result = await cache.get("C01");

		expect(mockCacheManager.get).toHaveBeenCalledWith("symptom:C01");
		expect(result).toEqual(mockSymptom);
	});

	it("should set a symptom in cache manager with TTL", async () => {
		const mockSymptom = {
			cui: "C01",
			clinicalName: "Fever",
			laymanTerm: "Febre",
			bodyRegion: "constitutional",
		};

		await cache.set("C01", mockSymptom);

		expect(mockCacheManager.set).toHaveBeenCalledWith(
			"symptom:C01",
			mockSymptom,
			3600000,
		);
	});

	it("should filter symptoms by body region case-insensitively", async () => {
		const symptoms = [
			{
				cui: "C01",
				clinicalName: "Fever",
				laymanTerm: "Febre",
				bodyRegion: "constitutional",
			},
			{
				cui: "C02",
				clinicalName: "Headache",
				laymanTerm: "Dor de cabeça",
				bodyRegion: "head",
			},
			{
				cui: "C03",
				clinicalName: "Migraine",
				laymanTerm: "Enxaqueca",
				bodyRegion: "HEAD",
			},
			{ cui: "C04", clinicalName: "Chest Pain", laymanTerm: "Dor no peito" },
		];

		// Setup getAll internal implementation simulation
		await cache.set("C01", symptoms[0]);
		await cache.set("C02", symptoms[1]);
		await cache.set("C03", symptoms[2]);
		await cache.set("C04", symptoms[3]);

		vi.mocked(mockCacheManager.get).mockImplementation(async (key: string) => {
			const cui = key.split(":")[1];
			return symptoms.find((s) => s.cui === cui);
		});

		const result = await cache.getByRegion("head");

		expect(result).toHaveLength(2);
		expect(result.map((s) => s.cui)).toContain("C02");
		expect(result.map((s) => s.cui)).toContain("C03");
	});
});
