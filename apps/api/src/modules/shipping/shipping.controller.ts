import { asyncHandler } from '@/shared/utils/async-handler';
import { ApiResponse } from '@/shared/utils/api-response';
import { getShippingQuotes } from './shipping.service';
import { shippingQuoteSchema } from './shipping.validation';

export const quote = asyncHandler(async (req, res) => {
  const data = shippingQuoteSchema.parse(req.body);
  const quotes = await getShippingQuotes(data);
  ApiResponse.success(res, quotes);
});
