import type { KanbanCard } from "@/lib/buildcopilot-types";

export type CreateKanbanCardInput = {
  id: string;
  title: string;
  epic: string;
  priority: KanbanCard["priority"];
  estimate: number;
  assignee: string;
};

export function updateCardById(
  cards: KanbanCard[],
  cardId: string,
  updater: (card: KanbanCard) => KanbanCard,
): KanbanCard[] {
  return cards.map((card) => (card.id === cardId ? updater(card) : card));
}

export function createKanbanCard(input: CreateKanbanCardInput): KanbanCard {
  return {
    id: input.id,
    title: input.title.trim(),
    epic: input.epic.trim() || "Feature",
    priority: input.priority,
    estimate: input.estimate,
    assignee: input.assignee.trim() || "—",
    column: "todo",
    acceptance: [],
    build: {
      commits: [],
      completedTaskCount: 0,
    },
  };
}

export function addAcceptanceCriterion(
  cards: KanbanCard[],
  cardId: string,
  criterion: string,
): KanbanCard[] {
  const normalizedCriterion = criterion.trim();
  if (!normalizedCriterion) {
    return cards;
  }

  return updateCardById(cards, cardId, (card) => ({
    ...card,
    acceptance: [...card.acceptance, normalizedCriterion],
  }));
}

export function removeAcceptanceCriterion(
  cards: KanbanCard[],
  cardId: string,
  index: number,
): KanbanCard[] {
  return updateCardById(cards, cardId, (card) => ({
    ...card,
    acceptance: card.acceptance.filter((_, criterionIndex) => criterionIndex !== index),
  }));
}