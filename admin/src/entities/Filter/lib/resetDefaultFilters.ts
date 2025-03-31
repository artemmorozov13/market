import { FilterItemType, FilterVariantsEnum } from "../types/filterMenuTypes";

export const resetDefaultFilters = (filters: FilterItemType[]) => {
    return filters.reduce((acc, filter) => {
        if (filter.type === FilterVariantsEnum.BooleanSelect) {
            acc[filter.name] = false;
        }
        if (filter.type === FilterVariantsEnum.MultiSelectValue) {
            acc[filter.name] = [];
        }
        if (filter.type === FilterVariantsEnum.SingleSelectValue) {
            acc[filter.name] = [];
        }
        return acc;
    }, {} as Record<string, any>);
}