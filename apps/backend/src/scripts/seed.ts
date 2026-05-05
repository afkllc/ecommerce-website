import {
  CreateInventoryLevelInput,
  ExecArgs,
  UpdateInventoryLevelInput,
} from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createServiceZonesWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateInventoryLevelsWorkflow,
  updateRegionsWorkflow,
  updateShippingOptionsWorkflow,
  updateStockLocationsWorkflow,
  updateStoresStep,
  updateStoresWorkflow,
  updateTaxRegionsWorkflow,
} from "@medusajs/medusa/core-flows";
import { ApiKey } from "../../.medusa/types/query-entry-points";

const countries = ["gb", "de", "dk", "se", "fr", "es", "it"];
const defaultSalesChannelName = "Default Sales Channel";
const regionName = "Europe";
const stockLocationName = "European Warehouse";
const fulfillmentSetName = "European Warehouse delivery";
const shippingProfileName = "Default Shipping Profile";
const standardShippingName = "Standard Shipping";
const expressShippingName = "Express Shipping";
const storefrontApiKeyTitle = "AllPencils Storefront";
const demoInventoryQuantity = 1000000;

type SeedRegion = {
  id: string;
  name?: string;
  currency_code?: string;
};

type SeedStockLocation = {
  id: string;
  name?: string;
};

type SeedTaxRegion = {
  id: string;
  country_code: string;
  provider_id?: string | null;
};

type SeedFulfillmentSet = {
  id: string;
  service_zones?: {
    id: string;
  }[];
};

type SeedCategory = {
  id: string;
  name: string;
};

const pencilProductHandles = [
  "cedar-classroom-hb-set",
  "soft-shade-artist-trio",
  "colour-burst-studio-tin",
  "watercolour-wash-pencil-pack",
  "precision-draft-mechanical-pencil",
  "field-notes-sketch-kit",
];

function createPlaceholderImage(
  label: string,
  background: string,
  foreground: string
) {
  return {
    url: `https://placehold.co/1200x1600/${background}/${foreground}.png?text=${encodeURIComponent(
      label
    )}`,
  };
}

function createPricePair(eurAmount: number, usdAmount: number) {
  return [
    {
      amount: eurAmount,
      currency_code: "eur",
    },
    {
      amount: usdAmount,
      currency_code: "usd",
    },
  ];
}

function createEuropeGeoZones() {
  return countries.map((country_code) => ({
    country_code,
    type: "country" as const,
  }));
}

const updateStoreCurrencies = createWorkflow(
  "update-store-currencies",
  (input: {
    supported_currencies: { currency_code: string; is_default?: boolean }[];
    store_id: string;
  }) => {
    const normalizedInput = transform({ input }, (data) => {
      return {
        selector: { id: data.input.store_id },
        update: {
          supported_currencies: data.input.supported_currencies.map(
            (currency) => {
              return {
                currency_code: currency.currency_code,
                is_default: currency.is_default ?? false,
              };
            }
          ),
        },
      };
    });

    const stores = updateStoresStep(normalizedInput);

    return new WorkflowResponse(stores);
  }
);

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);

  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
  });
  const existingProductHandles = new Set(
    (existingProducts ?? []).map((product: { handle: string }) => product.handle)
  );

  logger.info("Seeding store data...");
  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: defaultSalesChannelName,
  });

  if (!defaultSalesChannel.length) {
    // create the default sales channel
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [
          {
            name: defaultSalesChannelName,
          },
        ],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  await updateStoreCurrencies(container).run({
    input: {
      store_id: store.id,
      supported_currencies: [
        {
          currency_code: "eur",
          is_default: true,
        },
        {
          currency_code: "usd",
        },
      ],
    },
  });

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });

  logger.info("Seeding region data...");
  const { data: existingRegions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code"],
  });
  let region = ((existingRegions ?? []) as SeedRegion[]).find(
    (existingRegion) => existingRegion.name === regionName
  );

  if (!region) {
    const { result: regionResult } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: regionName,
            currency_code: "eur",
            countries,
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    });

    region = regionResult[0] as SeedRegion;
  } else {
    const { result: regionResult } = await updateRegionsWorkflow(container).run({
      input: {
        selector: { id: region.id },
        update: {
          name: regionName,
          currency_code: "eur",
          countries,
          payment_providers: ["pp_system_default"],
        },
      } as never,
    });

    region = (regionResult[0] as SeedRegion | undefined) ?? region;
  }

  if (!region) {
    throw new Error("Seed failed to reconcile a region.");
  }
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  const { data: existingTaxRegions } = await query.graph({
    entity: "tax_region",
    fields: ["id", "country_code", "provider_id"],
  });
  const taxRegionsByCountry = new Map<string, SeedTaxRegion>(
    ((existingTaxRegions ?? []) as SeedTaxRegion[]).map((taxRegion) => [
      taxRegion.country_code,
      taxRegion,
    ])
  );
  const missingTaxCountries = countries.filter(
    (country_code) => !taxRegionsByCountry.has(country_code)
  );
  const taxRegionUpdates: { id: string; provider_id: string }[] = [];

  for (const country_code of countries) {
    const taxRegion = taxRegionsByCountry.get(country_code);

    if (taxRegion && taxRegion.provider_id !== "tp_system") {
      taxRegionUpdates.push({
        id: taxRegion.id,
        provider_id: "tp_system",
      });
    }
  }

  if (missingTaxCountries.length) {
    await createTaxRegionsWorkflow(container).run({
      input: missingTaxCountries.map((country_code) => ({
        country_code,
        provider_id: "tp_system",
      })),
    });
  }

  if (taxRegionUpdates.length) {
    await updateTaxRegionsWorkflow(container).run({
      input: taxRegionUpdates,
    });
  }
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const { data: existingStockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  });
  let stockLocation = ((existingStockLocations ?? []) as SeedStockLocation[]).find(
    (location) => location.name === stockLocationName
  );

  if (!stockLocation) {
    const { result: stockLocationResult } = await createStockLocationsWorkflow(
      container
    ).run({
      input: {
        locations: [
          {
            name: stockLocationName,
            address: {
              city: "Copenhagen",
              country_code: "DK",
              address_1: "",
            },
          },
        ],
      },
    });

    stockLocation = stockLocationResult[0] as SeedStockLocation;
  } else {
    const { result: stockLocationResult } =
      await updateStockLocationsWorkflow(container).run({
        input: {
          selector: { id: stockLocation.id },
          update: {
            name: stockLocationName,
            address: {
              city: "Copenhagen",
              country_code: "DK",
              address_1: "",
            },
          },
        },
      });

    stockLocation =
      (stockLocationResult[0] as SeedStockLocation | undefined) ?? stockLocation;
  }

  if (!stockLocation) {
    throw new Error("Seed failed to reconcile a stock location.");
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_location_id: stockLocation.id,
      },
    },
  });

  const { data: existingFulfillmentProviderLinks } = await query.graph({
    entity: "location_fulfillment_provider",
    fields: ["stock_location_id", "fulfillment_provider_id"],
    filters: {
      stock_location_id: stockLocation.id,
      fulfillment_provider_id: "manual_manual",
    },
  });

  if (!existingFulfillmentProviderLinks?.length) {
    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_provider_id: "manual_manual",
      },
    });
  }

  logger.info("Seeding fulfillment data...");
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  let shippingProfile =
    shippingProfiles.find((profile) => profile.name === shippingProfileName) ??
    shippingProfiles[0] ??
    null;

  if (!shippingProfile) {
    const { result: shippingProfileResult } =
      await createShippingProfilesWorkflow(container).run({
        input: {
          data: [
            {
              name: shippingProfileName,
              type: "default",
            },
          ],
        },
      });
    shippingProfile = shippingProfileResult[0];
  }

  const existingFulfillmentSets =
    await fulfillmentModuleService.listFulfillmentSets(
      {
        name: fulfillmentSetName,
      },
      {
        relations: ["service_zones"],
      }
    );
  let fulfillmentSet = existingFulfillmentSets[0] as
    | SeedFulfillmentSet
    | undefined;

  if (!fulfillmentSet) {
    fulfillmentSet = (await fulfillmentModuleService.createFulfillmentSets({
      name: fulfillmentSetName,
      type: "shipping",
      service_zones: [
        {
          name: regionName,
          geo_zones: createEuropeGeoZones(),
        },
      ],
    } as never)) as unknown as SeedFulfillmentSet;
  } else if (!fulfillmentSet.service_zones?.length) {
    const { result: serviceZones } = await createServiceZonesWorkflow(
      container
    ).run({
      input: {
        data: [
          {
            name: regionName,
            fulfillment_set_id: fulfillmentSet.id,
            geo_zones: createEuropeGeoZones(),
          },
        ],
      },
    });

    fulfillmentSet = {
      ...fulfillmentSet,
      service_zones: serviceZones,
    };
  }

  if (!fulfillmentSet) {
    throw new Error("Seed failed to reconcile a fulfillment set.");
  }

  const { data: existingFulfillmentSetLinks } = await query.graph({
    entity: "location_fulfillment_set",
    fields: ["stock_location_id", "fulfillment_set_id"],
    filters: {
      stock_location_id: stockLocation.id,
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  if (!existingFulfillmentSetLinks?.length) {
    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_set_id: fulfillmentSet.id,
      },
    });
  }

  const serviceZoneId = fulfillmentSet.service_zones?.[0]?.id;

  if (!serviceZoneId) {
    throw new Error("Seed failed to reconcile a fulfillment service zone.");
  }

  const shippingOptionsToSeed = [
    {
      name: standardShippingName,
      price_type: "flat",
      provider_id: "manual_manual",
      service_zone_id: serviceZoneId,
      shipping_profile_id: shippingProfile.id,
      type: {
        label: "Standard",
        description: "Ship in 2-3 days.",
        code: "standard",
      },
      prices: [
        {
          currency_code: "usd",
          amount: 10,
        },
        {
          currency_code: "eur",
          amount: 10,
        },
        {
          region_id: region.id,
          amount: 10,
        },
      ],
      rules: [
        {
          attribute: "enabled_in_store",
          value: "true",
          operator: "eq",
        },
        {
          attribute: "is_return",
          value: "false",
          operator: "eq",
        },
      ],
    },
    {
      name: expressShippingName,
      price_type: "flat",
      provider_id: "manual_manual",
      service_zone_id: serviceZoneId,
      shipping_profile_id: shippingProfile.id,
      type: {
        label: "Express",
        description: "Ship in 24 hours.",
        code: "express",
      },
      prices: [
        {
          currency_code: "usd",
          amount: 10,
        },
        {
          currency_code: "eur",
          amount: 10,
        },
        {
          region_id: region.id,
          amount: 10,
        },
      ],
      rules: [
        {
          attribute: "enabled_in_store",
          value: "true",
          operator: "eq",
        },
        {
          attribute: "is_return",
          value: "false",
          operator: "eq",
        },
      ],
    },
  ];
  const seededShippingOptionNames = shippingOptionsToSeed.map(
    (option) => option.name
  );
  const existingShippingOptions =
    await fulfillmentModuleService.listShippingOptions(
      {
        name: seededShippingOptionNames,
      } as never,
      {
        select: ["id", "name"],
      }
    );
  const existingShippingOptionNames = new Set(
    existingShippingOptions.map((option) => option.name)
  );
  const missingShippingOptions = shippingOptionsToSeed.filter(
    (option) => !existingShippingOptionNames.has(option.name)
  );

  if (missingShippingOptions.length) {
    await createShippingOptionsWorkflow(container).run({
      input: missingShippingOptions as never,
    });
  }

  const shippingOptionUpdates = existingShippingOptions.map((option) => {
    const seedOption = shippingOptionsToSeed.find(
      (shippingOption) => shippingOption.name === option.name
    );

    return {
      id: option.id,
      ...seedOption,
    };
  });

  if (shippingOptionUpdates.length) {
    await updateShippingOptionsWorkflow(container).run({
      input: shippingOptionUpdates as never,
    });
  }
  logger.info("Finished seeding fulfillment data.");

  const { data: existingSalesChannelLocationLinks } = await query.graph({
    entity: "sales_channel_location",
    fields: ["sales_channel_id", "stock_location_id"],
    filters: {
      sales_channel_id: defaultSalesChannel[0].id,
      stock_location_id: stockLocation.id,
    },
  });

  if (!existingSalesChannelLocationLinks?.length) {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: stockLocation.id,
        add: [defaultSalesChannel[0].id],
      },
    });
  }
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding publishable API key data...");
  let publishableApiKey: ApiKey | null = null;
  const { data } = await query.graph({
    entity: "api_key",
    fields: ["id", "title"],
    filters: {
      type: "publishable",
    },
  });

  publishableApiKey =
    data?.find((apiKey: ApiKey) => apiKey.title === storefrontApiKeyTitle) ??
    data?.[0];

  if (!publishableApiKey) {
    const {
      result: [publishableApiKeyResult],
    } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: storefrontApiKeyTitle,
            type: "publishable",
            created_by: "",
          },
        ],
      },
    });

    publishableApiKey = publishableApiKeyResult as ApiKey;
  }

  const { data: existingApiKeyLinks } = await query.graph({
    entity: "publishable_api_key_sales_channel",
    fields: ["publishable_key_id", "sales_channel_id"],
    filters: {
      publishable_key_id: publishableApiKey.id,
      sales_channel_id: defaultSalesChannel[0].id,
    },
  });

  if (!existingApiKeyLinks?.length) {
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: {
        id: publishableApiKey.id,
        add: [defaultSalesChannel[0].id],
      },
    });
  }
  logger.info("Finished seeding publishable API key data.");

  logger.info("Seeding product data...");
  const categorySeeds = [
    {
      name: "Graphite",
      is_active: true,
    },
    {
      name: "Colour Pencil Sets",
      is_active: true,
    },
    {
      name: "Mechanical",
      is_active: true,
    },
    {
      name: "Sketch Kits",
      is_active: true,
    },
  ];
  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
  });
  const existingCategoryNames = new Set(
    (existingCategories ?? []).map((category: { name: string }) => category.name)
  );
  const missingCategories = categorySeeds.filter(
    (category) => !existingCategoryNames.has(category.name)
  );
  const { result: createdCategories = [] } = missingCategories.length
    ? await createProductCategoriesWorkflow(container).run({
        input: {
          product_categories: missingCategories,
        },
      })
    : { result: [] };
  const categoryResult = [
    ...((existingCategories ?? []) as SeedCategory[]),
    ...(createdCategories as SeedCategory[]),
  ];

  const demoProducts = [
        {
          title: "Cedar Classroom HB Set",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Graphite")!.id,
          ],
          description:
            "A clean twelve-or-twenty-four pack of cedar pencils designed for everyday writing, note taking, and quick sketches at the desk.",
          handle: "cedar-classroom-hb-set",
          weight: 180,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            createPlaceholderImage("Cedar Classroom Set", "f5ead6", "3e2d1d"),
            createPlaceholderImage("HB Core Detail", "efe1cb", "5e4730"),
          ],
          options: [
            {
              title: "Pack Size",
              values: ["12 pencils", "24 pencils"],
            },
          ],
          variants: [
            {
              title: "12 pencils",
              sku: "CEDAR-HB-12",
              options: {
                "Pack Size": "12 pencils",
              },
              prices: createPricePair(12, 14),
            },
            {
              title: "24 pencils",
              sku: "CEDAR-HB-24",
              options: {
                "Pack Size": "24 pencils",
              },
              prices: createPricePair(22, 26),
            },
          ],
          metadata: {
            audience: "students and everyday writers",
            recommendation_tags: ["graphite", "classroom", "everyday"],
            story: "The reliable starter set for the AllPencils demo catalogue.",
          },
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Soft Shade Artist Trio",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Graphite")!.id,
          ],
          description:
            "A studio-friendly graphite trio with softer leads for layering value, gesture drawing, and warm shadow work on textured paper.",
          handle: "soft-shade-artist-trio",
          weight: 90,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            createPlaceholderImage("Soft Shade Trio", "ede3d3", "34261b"),
            createPlaceholderImage("Artist Grades", "ddd0bd", "5c4734"),
          ],
          options: [
            {
              title: "Lead Grade",
              values: ["2B", "4B", "6B"],
            },
          ],
          variants: [
            {
              title: "2B",
              sku: "SOFT-SHADE-2B",
              options: {
                "Lead Grade": "2B",
              },
              prices: createPricePair(8, 10),
            },
            {
              title: "4B",
              sku: "SOFT-SHADE-4B",
              options: {
                "Lead Grade": "4B",
              },
              prices: createPricePair(8, 10),
            },
            {
              title: "6B",
              sku: "SOFT-SHADE-6B",
              options: {
                "Lead Grade": "6B",
              },
              prices: createPricePair(9, 11),
            },
          ],
          metadata: {
            audience: "artists and illustrators",
            recommendation_tags: ["graphite", "artist", "shading"],
            story: "Built for sketchbook sessions and tonal studies.",
          },
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Colour Burst Studio Tin",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Colour Pencil Sets")!.id,
          ],
          description:
            "A bright colour-pencil tin with rich pigment and a smooth wax core for layering, lettering, and bold product mock-ups.",
          handle: "colour-burst-studio-tin",
          weight: 260,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            createPlaceholderImage("Colour Burst Tin", "f3dfd0", "512e1f"),
            createPlaceholderImage("Studio Palette", "ead0c0", "6b4334"),
          ],
          options: [
            {
              title: "Palette",
              values: ["24 colours", "48 colours"],
            },
          ],
          variants: [
            {
              title: "24 colours",
              sku: "COLOUR-BURST-24",
              options: {
                Palette: "24 colours",
              },
              prices: createPricePair(18, 22),
            },
            {
              title: "48 colours",
              sku: "COLOUR-BURST-48",
              options: {
                Palette: "48 colours",
              },
              prices: createPricePair(30, 36),
            },
          ],
          metadata: {
            audience: "designers and hobby colourists",
            recommendation_tags: ["colour", "studio", "bold"],
            story: "The vivid everyday colour set for client-facing demos.",
          },
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Watercolour Wash Pencil Pack",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Colour Pencil Sets")!.id,
          ],
          description:
            "Water-soluble pencils that move from crisp lines to soft washes, aimed at travel journals and quick atmospheric studies.",
          handle: "watercolour-wash-pencil-pack",
          weight: 220,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            createPlaceholderImage("Watercolour Wash", "dde8e1", "264236"),
            createPlaceholderImage("Travel Washes", "c9d9d1", "355447"),
          ],
          options: [
            {
              title: "Palette",
              values: ["12 colours", "24 colours"],
            },
          ],
          variants: [
            {
              title: "12 colours",
              sku: "WATERCOLOUR-12",
              options: {
                Palette: "12 colours",
              },
              prices: createPricePair(16, 19),
            },
            {
              title: "24 colours",
              sku: "WATERCOLOUR-24",
              options: {
                Palette: "24 colours",
              },
              prices: createPricePair(28, 33),
            },
          ],
          metadata: {
            audience: "urban sketchers and travel journal users",
            recommendation_tags: ["colour", "travel", "watercolour"],
            story: "Made for quick colour blocking and painterly detail.",
          },
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Precision Draft Mechanical Pencil",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Mechanical")!.id,
          ],
          description:
            "A slim drafting pencil with a steady metal grip and dependable click action for diagrams, annotations, and technical notes.",
          handle: "precision-draft-mechanical-pencil",
          weight: 80,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            createPlaceholderImage("Precision Draft", "d9dee6", "253243"),
            createPlaceholderImage("Metal Grip Detail", "c6ccd5", "39495d"),
          ],
          options: [
            {
              title: "Lead Size",
              values: ["0.5 mm", "0.7 mm"],
            },
          ],
          variants: [
            {
              title: "0.5 mm",
              sku: "PRECISION-DRAFT-05",
              options: {
                "Lead Size": "0.5 mm",
              },
              prices: createPricePair(14, 17),
            },
            {
              title: "0.7 mm",
              sku: "PRECISION-DRAFT-07",
              options: {
                "Lead Size": "0.7 mm",
              },
              prices: createPricePair(14, 17),
            },
          ],
          metadata: {
            audience: "architects and technical note-takers",
            recommendation_tags: ["mechanical", "technical", "precision"],
            story: "The sharp, modern option in the AllPencils lineup.",
          },
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Field Notes Sketch Kit",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Sketch Kits")!.id,
          ],
          description:
            "A compact sketch kit pairing core pencils with an on-the-go layout, aimed at commuters, cafe sketchers, and client walk-throughs.",
          handle: "field-notes-sketch-kit",
          weight: 280,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            createPlaceholderImage("Field Notes Kit", "e6ecf2", "223548"),
            createPlaceholderImage("Travel Sketch Kit", "d1dae4", "3d5368"),
          ],
          options: [
            {
              title: "Kit Size",
              values: ["Travel", "Studio"],
            },
          ],
          variants: [
            {
              title: "Travel",
              sku: "FIELD-NOTES-TRAVEL",
              options: {
                "Kit Size": "Travel",
              },
              prices: createPricePair(24, 28),
            },
            {
              title: "Studio",
              sku: "FIELD-NOTES-STUDIO",
              options: {
                "Kit Size": "Studio",
              },
              prices: createPricePair(32, 38),
            },
          ],
          metadata: {
            audience: "travelling creatives",
            recommendation_tags: ["travel", "sketch", "kit"],
            story: "A portable bundle that rounds out the pencil-shop demo.",
          },
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
  ];
  const missingProducts = demoProducts.filter(
    (product) => !existingProductHandles.has(product.handle)
  );

  if (missingProducts.length) {
    await createProductsWorkflow(container).run({
      input: {
        products: missingProducts,
      },
    });
  }
  logger.info("Finished seeding product data.");

  logger.info("Seeding inventory levels.");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  const { data: existingInventoryLevels } = await query.graph({
    entity: "inventory_level",
    fields: ["id", "inventory_item_id", "location_id", "stocked_quantity"],
    filters: {
      location_id: stockLocation.id,
    },
  });
  const existingInventoryLevelsByItem = new Map(
    (existingInventoryLevels ?? []).map(
      (inventoryLevel: {
        id: string;
        inventory_item_id: string;
        stocked_quantity: number;
      }) => [inventoryLevel.inventory_item_id, inventoryLevel]
    )
  );
  const inventoryLevels: CreateInventoryLevelInput[] = [];
  const inventoryLevelUpdates: UpdateInventoryLevelInput[] = [];

  for (const inventoryItem of inventoryItems) {
    const existingInventoryLevel = existingInventoryLevelsByItem.get(
      inventoryItem.id
    );

    if (existingInventoryLevel) {
      if (existingInventoryLevel.stocked_quantity !== demoInventoryQuantity) {
        inventoryLevelUpdates.push({
          id: existingInventoryLevel.id,
          location_id: stockLocation.id,
          stocked_quantity: demoInventoryQuantity,
          inventory_item_id: inventoryItem.id,
        });
      }

      continue;
    }

    const inventoryLevel: CreateInventoryLevelInput = {
      location_id: stockLocation.id,
      stocked_quantity: demoInventoryQuantity,
      inventory_item_id: inventoryItem.id,
    };

    inventoryLevels.push(inventoryLevel);
  }

  if (inventoryLevels.length) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: inventoryLevels,
      },
    });
  }

  if (inventoryLevelUpdates.length) {
    await updateInventoryLevelsWorkflow(container).run({
      input: {
        updates: inventoryLevelUpdates,
      },
    });
  }

  logger.info("Finished seeding inventory levels data.");
}
