import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
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
  updateStoresStep,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { ApiKey } from "../../.medusa/types/query-entry-points";

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

  const countries = ["gb", "de", "dk", "se", "fr", "es", "it"];
  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["handle"],
  });
  const existingProductHandles = new Set(
    (existingProducts ?? []).map((product: { handle: string }) => product.handle)
  );

  if (
    pencilProductHandles.every((handle) => existingProductHandles.has(handle))
  ) {
    logger.info("Pencil demo products already exist. Skipping duplicate seed run.");

    const { data: existingApiKeys } = await query.graph({
      entity: "api_key",
      fields: ["token"],
      filters: {
        type: "publishable",
      },
    });

    if (existingApiKeys?.[0]?.token) {
      logger.info(`MEDUSA_PUBLISHABLE_KEY=${existingApiKeys[0].token}`);
    }

    return;
  }

  logger.info("Seeding store data...");
  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    // create the default sales channel
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [
          {
            name: "Default Sales Channel",
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
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Europe",
          currency_code: "eur",
          countries,
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  const region = regionResult[0];
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  });
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "European Warehouse",
          address: {
            city: "Copenhagen",
            country_code: "DK",
            address_1: "",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_location_id: stockLocation.id,
      },
    },
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  logger.info("Seeding fulfillment data...");
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;

  if (!shippingProfile) {
    const { result: shippingProfileResult } =
      await createShippingProfilesWorkflow(container).run({
        input: {
          data: [
            {
              name: "Default Shipping Profile",
              type: "default",
            },
          ],
        },
      });
    shippingProfile = shippingProfileResult[0];
  }

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "European Warehouse delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Europe",
        geo_zones: [
          {
            country_code: "gb",
            type: "country",
          },
          {
            country_code: "de",
            type: "country",
          },
          {
            country_code: "dk",
            type: "country",
          },
          {
            country_code: "se",
            type: "country",
          },
          {
            country_code: "fr",
            type: "country",
          },
          {
            country_code: "es",
            type: "country",
          },
          {
            country_code: "it",
            type: "country",
          },
        ],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
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
        name: "Express Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
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
    ],
  });
  logger.info("Finished seeding fulfillment data.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding publishable API key data...");
  let publishableApiKey: ApiKey | null = null;
  const { data } = await query.graph({
    entity: "api_key",
    fields: ["id", "token", "title"],
    filters: {
      type: "publishable",
    },
  });

  publishableApiKey = data?.[0];

  if (!publishableApiKey) {
    const {
      result: [publishableApiKeyResult],
    } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "AllPencils Storefront",
            type: "publishable",
            created_by: "",
          },
        ],
      },
    });

    publishableApiKey = publishableApiKeyResult as ApiKey;
  }

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding publishable API key data.");
  logger.info(`MEDUSA_PUBLISHABLE_KEY=${publishableApiKey.token}`);

  logger.info("Seeding product data...");

  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
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
      ],
    },
  });

  await createProductsWorkflow(container).run({
    input: {
      products: [
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
      ],
    },
  });
  logger.info("Finished seeding product data.");

  logger.info("Seeding inventory levels.");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  const inventoryLevels: CreateInventoryLevelInput[] = [];
  for (const inventoryItem of inventoryItems) {
    const inventoryLevel = {
      location_id: stockLocation.id,
      stocked_quantity: 1000000,
      inventory_item_id: inventoryItem.id,
    };
    inventoryLevels.push(inventoryLevel);
  }

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryLevels,
    },
  });

  logger.info("Finished seeding inventory levels data.");
}
