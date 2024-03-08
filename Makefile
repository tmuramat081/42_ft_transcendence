
all : up

up : 
	docker compose up -d

down : 
	docker compose down

stop : 
	docker compose stop

start : 
	docker compose start

clean :
	docker compose down -v --rmi all --remove-orphans

fclean : clean
	docker stop $(docker ps -qa); docker rm $(docker ps -qa); docker rmi -f $(docker image -qa); docker volume rm $(docker volume ls -q); docker network rm $(docker network ls -q) ; docker builder prune -f 2>/dev/null

re : fclean all

status : 
	@docker ps

.PHONY : all up down stop start clean fclean status
