import Filter from "./Filter";

function DashboardFilter() {
  return (
    <Filter
      filterField="last"
      options={[
        { value: "1", label: "Hôm nay" },
        { value: "7", label: "7 ngày gần đây" },
        { value: "30", label: "30 ngày gần đây" },
      ]}
    />
  );
}

export default DashboardFilter;
