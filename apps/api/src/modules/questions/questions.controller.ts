import { asyncHandler } from '@/shared/utils/async-handler';
import { ApiResponse } from '@/shared/utils/api-response';
import { getPagination } from '@/shared/utils/pagination';
import {
  askQuestion,
  listProductQuestions,
  answerQuestion,
  deleteQuestion,
} from './questions.service';
import { askQuestionSchema, answerQuestionSchema } from './questions.validation';

export const ask = asyncHandler(async (req, res) => {
  const data = askQuestionSchema.parse(req.body);
  const question = await askQuestion(req.user!.userId, data);
  ApiResponse.created(res, question, 'Question posted');
});

export const productQuestions = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { items, meta } = await listProductQuestions(String(req.params.productId), pagination);
  ApiResponse.paginated(res, items, meta);
});

export const answer = asyncHandler(async (req, res) => {
  const { answer: text } = answerQuestionSchema.parse(req.body);
  const question = await answerQuestion(req.user!, String(req.params.id), text);
  ApiResponse.success(res, question, 'Answer posted');
});

export const remove = asyncHandler(async (req, res) => {
  await deleteQuestion(req.user!, String(req.params.id));
  ApiResponse.success(res, undefined, 'Question deleted');
});
