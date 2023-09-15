import type { ENV } from "./types";

import { z } from "zod";
import { fromZodError } from "zod-validation-error";

import getValidationDataset from "../../../utils/getValidationDataset";
import createModuleWorker, { reply } from "../../../utils/createModuleWorker";

const PaymentCupOfKindnessSchema = z.object({
  origin: z.string().url(),
  paymentID: z.string().uuid(),
  "Cup of Kindness": z.string(),
});

type PaymentCupOfKindness = z.infer<typeof PaymentCupOfKindnessSchema>;

async function updateCupOfKindness(request: Request, env: ENV) {
  let paymentCupOfKindnessData;

  try {
    const parsedBody = await request.json<PaymentCupOfKindness>();

    paymentCupOfKindnessData = PaymentCupOfKindnessSchema.parse(parsedBody);
  } catch (error) {
    return reply(
      {
        message: "Validation error!",
        errors: fromZodError(error).toString().slice(18).split(";"),
      },
      400,
    );
  }

  const {
    origin,
    paymentID,
    "Cup of Kindness": cupOfKindness,
  } = paymentCupOfKindnessData;

  const validationDataset = await getValidationDataset(origin, env);

  const kindnessCauses = validationDataset.kindnessCauses.data.map(
    ({ attributes: { cause } }) => cause,
  );

  if (!kindnessCauses.includes(cupOfKindness)) {
    return reply(
      {
        message: "Validation error!",
        error: "Invalid 'Cup of Kindness' value",
      },
      400,
    );
  }

  const PAYMENT_INTENTS = env.ECOMMERCE_PAYMENTS;

  const paymentIntentData = JSON.parse(await PAYMENT_INTENTS.get(paymentID)),
    { paymentBaserowRecordID: rowID } = paymentIntentData;

  const databaseTableID = env.BASEROW_PAYMENT_RECORDS_TABLE_ID;

  await fetch(
    `https://api.baserow.io/api/database/rows/table/${databaseTableID}/${rowID}/?user_field_names=true`,
    {
      method: "PATCH",
      body: JSON.stringify({
        "Cup of Kindness": cupOfKindness,
      }),
      headers: {
        Authorization: `Token ${env.BASEROW_TOKEN}`,
        "Content-Type": "application/json",
      },
    },
  ).then((res) => res.json<any>());

  return reply({ success: true }, 200);
}

export default createModuleWorker({
  pathname: "/order/cup-of-kindness",
  methods: { PATCH: updateCupOfKindness },
});
