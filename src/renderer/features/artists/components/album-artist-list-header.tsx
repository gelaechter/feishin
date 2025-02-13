import type { AgGridReact as AgGridReactType } from '@ag-grid-community/react/lib/agGridReact';
import { Flex, Group, Stack } from '@mantine/core';
import debounce from 'lodash/debounce';
import type { ChangeEvent, MutableRefObject } from 'react';
import { useListContext } from '../../../context/list-context';
import { useListStoreByKey } from '../../../store/list.store';
import { FilterBar } from '../../shared/components/filter-bar';
import { LibraryItem } from '/@/renderer/api/types';
import { PageHeader, SearchInput } from '/@/renderer/components';
import { VirtualInfiniteGridRef } from '/@/renderer/components/virtual-grid';
import { AlbumArtistListHeaderFilters } from '/@/renderer/features/artists/components/album-artist-list-header-filters';
import { LibraryHeaderBar } from '/@/renderer/features/shared';
import { useContainerQuery } from '/@/renderer/hooks';
import { useListFilterRefresh } from '/@/renderer/hooks/use-list-filter-refresh';
import { AlbumArtistListFilter, useCurrentServer, useListStoreActions } from '/@/renderer/store';
import { ListDisplayType } from '/@/renderer/types';

interface AlbumArtistListHeaderProps {
    gridRef: MutableRefObject<VirtualInfiniteGridRef | null>;
    itemCount?: number;
    tableRef: MutableRefObject<AgGridReactType | null>;
}

export const AlbumArtistListHeader = ({
    itemCount,
    gridRef,
    tableRef,
}: AlbumArtistListHeaderProps) => {
    const server = useCurrentServer();
    const { pageKey } = useListContext();
    const { display, filter } = useListStoreByKey({ key: pageKey });
    const { setFilter, setTablePagination } = useListStoreActions();
    const cq = useContainerQuery();

    const { handleRefreshGrid, handleRefreshTable } = useListFilterRefresh({
        itemType: LibraryItem.ALBUM_ARTIST,
        server,
    });

    const handleSearch = debounce((e: ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value === '' ? undefined : e.target.value;
        const updatedFilters = setFilter({
            data: { searchTerm },
            itemType: LibraryItem.ALBUM_ARTIST,
            key: pageKey,
        }) as AlbumArtistListFilter;

        if (display === ListDisplayType.TABLE || display === ListDisplayType.TABLE_PAGINATED) {
            handleRefreshTable(tableRef, updatedFilters);
            setTablePagination({ data: { currentPage: 0 }, key: pageKey });
        } else {
            handleRefreshGrid(gridRef, updatedFilters);
        }
    }, 500);

    return (
        <Stack
            ref={cq.ref}
            spacing={0}
        >
            <PageHeader backgroundColor="var(--titlebar-bg)">
                <Flex
                    justify="space-between"
                    w="100%"
                >
                    <LibraryHeaderBar>
                        <LibraryHeaderBar.Title>Album Artists</LibraryHeaderBar.Title>
                        <LibraryHeaderBar.Badge
                            isLoading={itemCount === null || itemCount === undefined}
                        >
                            {itemCount}
                        </LibraryHeaderBar.Badge>
                    </LibraryHeaderBar>
                    <Group>
                        <SearchInput
                            defaultValue={filter.searchTerm}
                            openedWidth={cq.isMd ? 250 : cq.isSm ? 200 : 150}
                            onChange={handleSearch}
                        />
                    </Group>
                </Flex>
            </PageHeader>
            <FilterBar>
                <AlbumArtistListHeaderFilters
                    gridRef={gridRef}
                    tableRef={tableRef}
                />
            </FilterBar>
        </Stack>
    );
};
