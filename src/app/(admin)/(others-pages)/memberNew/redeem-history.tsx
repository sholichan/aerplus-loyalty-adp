import dayjs from "dayjs";

export interface Redeem {
    id: string;
    point_used: string;
    redeem_code: string;
    start_period: string;
    end_period: string;
    redeemed_at: string;
    used_at: string | null;
    reward: any;
}

interface UserRedeemHistoryProps {
    redeems: Redeem[];
}

export const UserRedeemHistory: React.FC<UserRedeemHistoryProps> = ({ redeems }) => {
    const dateConvert = (isoString: string) => {
        const parsedDate = dayjs(isoString);
        const date: string = parsedDate.format('YYYY-MM-DD');
        return date
    }
    const ddmmmyyyConvert = (isoString: string) => {
        const parsedDate = dayjs(isoString);
        const date: string = parsedDate.format('DD/MM/YYYY');
        return date
    }
    
    return (
        <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Redeem History
            </h4>
            {(redeems?.length > 0) && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                {[
                                    "No",
                                    "Reward Name",
                                    "Points Used",
                                    "Code",
                                    "Period",
                                    "Redeem Date",
                                    "Date Used",
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {redeems.map((redeem, index) => (
                                <tr
                                    key={redeem.id}
                                    className={"hover:bg-gray-50 dark:hover:bg-gray-900"}
                                >
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-400">
                                        {index + 1}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-400">
                                        {redeem.reward.name}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {redeem.point_used}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {redeem.redeem_code}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {ddmmmyyyConvert(redeem.start_period)} - {ddmmmyyyConvert(redeem.end_period)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {dateConvert(redeem.redeemed_at)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {redeem.used_at ? dateConvert(redeem.used_at) : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {(redeems?.length === 0) && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No redeem history
                </div>
            )}
        </div>
    )
}