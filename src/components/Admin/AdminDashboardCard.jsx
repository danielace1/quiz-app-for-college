import PropTypes from "prop-types";

const AdminDashboardCard = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 p-5 bg-gradient-to-tr from-blue-50 to-blue-100 border border-blue-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
    <div className="p-3 bg-blue-600 text-white rounded-full shadow-md">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <h3 className="text-lg font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);

AdminDashboardCard.propTypes = {
  icon: PropTypes.node,
  label: PropTypes.string,
  value: PropTypes.string,
};

export default AdminDashboardCard;
