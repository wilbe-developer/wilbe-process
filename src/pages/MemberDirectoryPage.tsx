
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMembers } from "@/hooks/useMembers";
import MemberCard from "@/components/MemberCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

const MemberDirectoryPage = () => {
  const { members, loading, searchMembers } = useMembers();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedQuery(searchQuery);
  };
  
  const filteredMembers = debouncedQuery 
    ? searchMembers(debouncedQuery)
    : members;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold mb-4">Meet Your Community</h1>
        
        <form 
          onSubmit={handleSearch}
          className="max-w-md mx-auto flex gap-2"
        >
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">
            Search
          </Button>
        </form>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          Array(6)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="border rounded-lg p-6 space-y-4">
                <div className="flex items-center">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="ml-4 space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))
        ) : filteredMembers.length > 0 ? (
          filteredMembers.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-medium mb-2">No members found</h2>
            <p className="text-gray-500">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberDirectoryPage;
