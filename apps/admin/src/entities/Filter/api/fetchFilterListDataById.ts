import { AlphabetSortedListType } from '../types/filterMenuTypes'

export const fetchFilterListDataById = async (id: number) => {
  try {
    return data as AlphabetSortedListType[]
  } catch {
    throw new Error()
  }
}

const data: AlphabetSortedListType[] = [
  {
    char: 'B',
    items: [
      { label: 'Bonduelle', value: 'bonduelle' },
      { label: 'Bounty', value: 'bounty' },
      { label: 'Belvita', value: 'belvita' },
    ],
  },
  {
    char: 'C',
    items: [
      { label: 'Coca-Cola', value: 'coca_cola' },
      { label: 'Cheetos', value: 'cheetos' },
      { label: 'Chupa Chups', value: 'chupa_chups' },
    ],
  },
  {
    char: 'D',
    items: [
      { label: 'Danone', value: 'danone' },
      { label: 'Doritos', value: 'doritos' },
    ],
  },
  {
    char: 'H',
    items: [
      { label: 'Heinz', value: 'heinz' },
      { label: "Hershey's", value: 'hersheys' },
      { label: "Hellmann's", value: 'hellmanns' },
    ],
  },
  {
    char: 'L',
    items: [
      { label: "Lay's", value: 'lays' },
      { label: 'Lipton', value: 'lipton' },
      { label: 'Lindt', value: 'lindt' },
    ],
  },
  {
    char: 'M',
    items: [
      { label: 'Mars', value: 'mars' },
      { label: 'Milka', value: 'milka' },
      { label: "M&M's", value: 'mms' },
    ],
  },
  {
    char: 'N',
    items: [
      { label: 'Nestlé', value: 'nestle' },
      { label: 'Nutella', value: 'nutella' },
    ],
  },
  {
    char: 'P',
    items: [
      { label: 'Pepsi', value: 'pepsi' },
      { label: 'Pringles', value: 'pringles' },
    ],
  },
  {
    char: 'R',
    items: [
      { label: 'Ritter Sport', value: 'ritter_sport' },
      { label: 'Red Bull', value: 'red_bull' },
    ],
  },
  {
    char: 'T',
    items: [
      { label: 'Twix', value: 'twix' },
      { label: 'Toblerone', value: 'toblerone' },
    ],
  },
]
