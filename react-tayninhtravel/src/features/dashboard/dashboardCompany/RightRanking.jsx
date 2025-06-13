import styled, { css } from "styled-components";

import Spinner from "../../../ui/Spinner";
import DataItem from "./DataItem";
import { useTourRanking } from "./useTourRanking";

const StyledToday = styled.div`
  /* Box */
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);

  padding: 3.2rem;
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
  grid-column: 3 / span 2;
  padding-top: 2.4rem;
`;

const TodayList = styled.ul`
  overflow: scroll;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 0 !important;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;
`;

const NoActivity = styled.p`
  text-align: center;
  font-size: 1.8rem;
  font-weight: 500;
  margin-top: 0.8rem;
`;

const StyledHeading = styled.div`
  margin-bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  line-height: 1.4;
`;

const Heading = styled.h1`
  margin-bottom: 0;
  font-size: 1.9rem;
  font-weight: 550;
  ${(props) =>
    props.as === "h2" &&
    css`
      text-transform: uppercase;
    `}

  ${(props) => props.as === "h3" && css``}
    color: #f9ad14;

  text-align: left;
  line-height: 1.4;
`;
function RightRanking() {
  const { tourRankingCompany, isLoading } = useTourRanking();

  return (
    <StyledToday>
      <StyledHeading>
        <Heading as="h2">Bảng xếp hạng Tour yêu thích</Heading>
        <Heading as="h3">Số lượng: {tourRankingCompany?.length}</Heading>
      </StyledHeading>

      {!isLoading ? (
        tourRankingCompany?.length > 0 ? (
          <TodayList>
            {tourRankingCompany.map((activity, index) => (
              <DataItem key={index} activity={activity} />
            ))}
          </TodayList>
        ) : (
          <NoActivity>Không có dữ liệu...</NoActivity>
        )
      ) : (
        <Spinner />
      )}
    </StyledToday>
  );
}

export default RightRanking;
